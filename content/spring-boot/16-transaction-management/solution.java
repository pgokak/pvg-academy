// TRANSACTION MANAGEMENT — Solution

package com.example.shop.service;

import com.example.shop.model.Order;
import com.example.shop.model.AuditLog;
import com.example.shop.repository.OrderRepository;
import com.example.shop.repository.InventoryRepository;
import com.example.shop.repository.PaymentRepository;
import com.example.shop.repository.AuditRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final PaymentRepository paymentRepository;
    private final OrderCancellationService cancellationService; // injected separate bean — fixes self-invocation

    public OrderService(OrderRepository orderRepository,
                        InventoryRepository inventoryRepository,
                        PaymentRepository paymentRepository,
                        OrderCancellationService cancellationService) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.paymentRepository = paymentRepository;
        this.cancellationService = cancellationService;
    }

    // Task 1: @Transactional — all three writes are atomic
    // If paymentRepository.charge() throws, inventory deduction AND order save are rolled back
    @Transactional
    public Order placeOrder(Long customerId, Long productId, int quantity, BigDecimal price) {
        inventoryRepository.deduct(productId, quantity);

        Order order = new Order(customerId, productId, quantity, price, "PLACED");
        orderRepository.save(order);

        paymentRepository.charge(customerId, price.multiply(BigDecimal.valueOf(quantity)));

        return order;
    }

    // Task 2: readOnly = true — Hibernate skips dirty-checking and flush
    // ~10-15% performance improvement on read-heavy endpoints
    @Transactional(readOnly = true)
    public List<Order> getOrderHistory(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    // Task 3: rollbackFor = Exception.class — RefundException is checked, won't roll back by default
    @Transactional(rollbackFor = Exception.class)
    public void refundOrder(Long orderId) throws RefundException {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RefundException("Order not found: " + orderId));

        if (!order.isRefundable()) {
            throw new RefundException("Order " + orderId + " is not eligible for refund");
        }

        paymentRepository.refund(order.getCustomerId(), order.getTotal());
        order.setStatus("REFUNDED");
        orderRepository.save(order);
    }

    // Task 5: Fixed — calls the injected separate bean, not 'this'
    // The proxy is now in the call path, so @Transactional on cancellationService works
    public void cancelOrder(Long orderId) {
        cancellationService.processOrderCancellation(orderId);
    }
}

// ─── Separate bean to fix self-invocation problem ────────────────────────────
// @Transactional here works because it's called through a Spring proxy
// (injected into OrderService, not called via 'this')
@Service
public class OrderCancellationService {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final AuditService auditService;

    public OrderCancellationService(OrderRepository orderRepository,
                                    InventoryRepository inventoryRepository,
                                    AuditService auditService) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.auditService = auditService;
    }

    @Transactional
    public void processOrderCancellation(Long orderId) {
        // Audit log written in REQUIRES_NEW — survives even if this transaction rolls back
        auditService.auditOrderEvent("CANCEL_REQUESTED", orderId);

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        inventoryRepository.restore(order.getProductId(), order.getQuantity());
        order.setStatus("CANCELLED");
        orderRepository.save(order);

        auditService.auditOrderEvent("CANCEL_COMPLETED", orderId);
    }
}

// ─── Audit service with REQUIRES_NEW propagation ─────────────────────────────
// Task 4: REQUIRES_NEW suspends the caller's transaction.
// Audit log is committed independently — even if the caller rolls back, the audit row persists.
@Service
public class AuditService {

    private final AuditRepository auditRepository;

    public AuditService(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void auditOrderEvent(String action, Long orderId) {
        auditRepository.save(new AuditLog(action, orderId, Instant.now()));
    }
}

// Checked exception — must use rollbackFor = Exception.class for Spring to roll back
class RefundException extends Exception {
    public RefundException(String message) {
        super(message);
    }
}
