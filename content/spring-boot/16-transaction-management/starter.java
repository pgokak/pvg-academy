// TRANSACTION MANAGEMENT — Starter Exercise
//
// SCENARIO: An e-commerce OrderService that performs multiple DB writes.
// Right now nothing is transactional — a crash between steps leaves corrupted data.
//
// YOUR TASKS:
// 1. Add @Transactional to placeOrder() — all three writes must be atomic
// 2. Add @Transactional(readOnly = true) to getOrderHistory() — it only reads
// 3. Add @Transactional(rollbackFor = Exception.class) to refundOrder()
//    because it throws a checked RefundException
// 4. Fix auditOrderEvent() to use REQUIRES_NEW propagation so audit logs
//    are saved even if the calling transaction rolls back
// 5. Fix the self-invocation problem in cancelOrder() — it calls a
//    @Transactional method within the same class (hint: extract it)

package com.example.shop.service;

import com.example.shop.model.Order;
import com.example.shop.model.AuditLog;
import com.example.shop.repository.OrderRepository;
import com.example.shop.repository.InventoryRepository;
import com.example.shop.repository.PaymentRepository;
import com.example.shop.repository.AuditRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final PaymentRepository paymentRepository;
    private final AuditRepository auditRepository;

    public OrderService(OrderRepository orderRepository,
                        InventoryRepository inventoryRepository,
                        PaymentRepository paymentRepository,
                        AuditRepository auditRepository) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.paymentRepository = paymentRepository;
        this.auditRepository = auditRepository;
    }

    // TODO 1: Add @Transactional so all three writes are atomic.
    // If any step fails, ALL changes should be rolled back.
    public Order placeOrder(Long customerId, Long productId, int quantity, BigDecimal price) {
        // Step 1: Deduct inventory
        inventoryRepository.deduct(productId, quantity);

        // Step 2: Create order record
        Order order = new Order(customerId, productId, quantity, price, "PLACED");
        orderRepository.save(order);

        // Step 3: Record payment
        paymentRepository.charge(customerId, price.multiply(BigDecimal.valueOf(quantity)));

        return order;
    }

    // TODO 2: Add @Transactional(readOnly = true) — this method only reads data.
    // readOnly=true lets Hibernate skip dirty-checking for a performance boost.
    public List<Order> getOrderHistory(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    // TODO 3: Add @Transactional(rollbackFor = Exception.class)
    // RefundException is a checked exception — Spring won't roll back without this.
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

    // TODO 4: Add @Transactional(propagation = Propagation.REQUIRES_NEW)
    // Audit logs must be saved even if the calling transaction rolls back.
    // (A failed order should still have an audit trail.)
    public void auditOrderEvent(String action, Long orderId) {
        auditRepository.save(new AuditLog(action, orderId, Instant.now()));
    }

    // TODO 5: This method calls processOrderCancellation() on 'this' directly.
    // The @Transactional on processOrderCancellation() is IGNORED (self-invocation).
    // Fix this by injecting OrderCancellationService (a separate bean) and calling it there.
    public void cancelOrder(Long orderId) {
        auditOrderEvent("CANCEL_REQUESTED", orderId);
        processOrderCancellation(orderId); // BUG: same-class call bypasses Spring proxy
    }

    // This method's @Transactional is bypassed when called from cancelOrder() above
    @Transactional
    public void processOrderCancellation(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        inventoryRepository.restore(order.getProductId(), order.getQuantity());
        order.setStatus("CANCELLED");
        orderRepository.save(order);
    }
}

// Checked exception — Spring won't auto-rollback for this without rollbackFor
class RefundException extends Exception {
    public RefundException(String message) {
        super(message);
    }
}
