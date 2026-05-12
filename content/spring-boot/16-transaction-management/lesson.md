---
title: "Transaction Management"
version: "Spring Boot 3.x"
since: 2004
stable: true
---

## The Problem

```java
@Service
public class OrderService {

    public void placeOrder(Order order) {
        // Step 1: Deduct inventory
        inventoryRepository.deduct(order.getProductId(), order.getQuantity());

        // App crashes here — power outage, OOM, network timeout...

        // Step 2: Save the order — NEVER RUNS
        orderRepository.save(order);

        // Step 3: Charge the customer — NEVER RUNS
        paymentRepository.charge(order.getCustomerId(), order.getTotal());
    }
}
```

Inventory is deducted. The order and payment records don't exist. The data is now permanently inconsistent — stock is gone, revenue is lost, the customer was never charged.

## Mental Model

A transaction is a promise: either all steps complete or none do. Like a bank transfer — the debit and credit happen together, or neither happens. If anything goes wrong mid-transfer, the bank rolls the whole thing back as if it never started.

## @Transactional — Where to Put It

Place `@Transactional` at the **service layer** — never on repositories (already transactional) or controllers (too far from the data layer).

```java
// RIGHT — service layer owns the transaction boundary
@Service
public class OrderService {

    @Transactional
    public void placeOrder(Order order) {
        inventoryRepository.deduct(order.getProductId(), order.getQuantity());
        orderRepository.save(order);
        paymentRepository.charge(order.getCustomerId(), order.getTotal());
        // If ANY of these throw a RuntimeException, ALL changes are rolled back
    }
}

// WRONG — don't annotate the repository
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Spring Data already wraps each method in a transaction
}

// WRONG — don't annotate the controller
@RestController
public class OrderController {
    @Transactional  // Too far from data — mixing concerns
    @PostMapping("/orders")
    public ResponseEntity<Order> create(...) { ... }
}
```

## Propagation Types

Propagation controls what happens when a `@Transactional` method calls another `@Transactional` method.

| Propagation    | Behavior                                                       | Use when                                                |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| `REQUIRED`     | Join existing transaction; create one if none exists (default) | Most service methods                                    |
| `REQUIRES_NEW` | Suspend the current transaction; always start a fresh one      | Audit logging — must persist even if main tx rolls back |
| `NESTED`       | Create a savepoint inside the current transaction              | Partial rollback within a larger transaction            |
| `NEVER`        | Throw exception if a transaction is active                     | Methods that must run outside any transaction           |

```java
@Service
public class AuditService {

    // REQUIRES_NEW: audit log saved even if the calling transaction rolls back
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAuditEvent(String action, Long userId) {
        auditRepository.save(new AuditLog(action, userId, Instant.now()));
    }
}
```

## Isolation Levels

Isolation controls what a transaction can see from other concurrent transactions.

| Isolation Level   | Prevents Dirty Reads | Prevents Non-Repeatable Reads | Prevents Phantom Reads | Performance |
| ----------------- | -------------------- | ----------------------------- | ---------------------- | ----------- |
| `READ_COMMITTED`  | Yes                  | No                            | No                     | High        |
| `REPEATABLE_READ` | Yes                  | Yes                           | No                     | Medium      |
| `SERIALIZABLE`    | Yes                  | Yes                           | Yes                    | Low         |

- **Dirty read**: reading uncommitted changes from another transaction — data that might be rolled back
- **Non-repeatable read**: reading the same row twice within one transaction and getting different values
- **Phantom read**: a query returns different rows the second time because another transaction inserted/deleted rows

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public BigDecimal calculateAccountBalance(Long accountId) {
    // Same account balance query returns same value throughout this transaction
    BigDecimal initial = accountRepository.findBalance(accountId);
    // ... do more work ...
    BigDecimal current = accountRepository.findBalance(accountId); // same as initial
    return current;
}
```

## rollbackFor — Checked Exceptions Don't Roll Back by Default

By default, Spring only rolls back on `RuntimeException` (unchecked) and `Error`. Checked exceptions are **not** rolled back unless you explicitly say so.

```java
// DEFAULT — only RuntimeException triggers rollback
@Transactional
public void transfer(Long fromId, Long toId, BigDecimal amount) throws InsufficientFundsException {
    accountRepository.debit(fromId, amount);
    accountRepository.credit(toId, amount);
    // If InsufficientFundsException (checked) is thrown — NO rollback! Debit persists.
}

// RIGHT — explicitly roll back on any exception
@Transactional(rollbackFor = Exception.class)
public void transfer(Long fromId, Long toId, BigDecimal amount) throws InsufficientFundsException {
    accountRepository.debit(fromId, amount);
    accountRepository.credit(toId, amount);
    // Now any exception — checked or unchecked — triggers rollback
}
```

## readOnly = true — Performance Hint for Read Operations

```java
@Transactional(readOnly = true)
public List<Order> getOrdersByCustomer(Long customerId) {
    return orderRepository.findByCustomerId(customerId);
    // Hibernate skips dirty checking, flushes, and write locks
    // Roughly 10–15% performance improvement on read-heavy operations
}
```

## The Self-Invocation Problem

`@Transactional` works via Spring proxy — a generated wrapper class that intercepts calls. Calling a `@Transactional` method **from within the same class** bypasses the proxy.

```java
@Service
public class ReportService {

    @Transactional
    public void generateReport() {
        saveHeader();  // Calls method in the same class
        saveBody();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveBody() {
        // This @Transactional is IGNORED when called from generateReport()
        // Spring's proxy is not in the call path — it's a direct method call
        reportBodyRepository.save(...);
    }
}

// FIX: Extract saveBody() into a separate @Service bean
// When Spring injects it, calls go through the proxy and transactions work
@Service
public class ReportBodyService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveBody(ReportData data) { ... }
}
```

## Common Mistake

Putting `@Transactional` on a `private` method, or calling a `@Transactional` method from within the same class:

```java
// BROKEN — private method, Spring proxy can't intercept it
@Service
public class PaymentService {

    public void processPayment(Payment payment) {
        savePaymentRecord(payment);  // Direct call — no proxy
    }

    @Transactional  // IGNORED — Spring can't wrap private methods
    private void savePaymentRecord(Payment payment) {
        paymentRepository.save(payment);
        ledgerRepository.addEntry(payment);
        // These won't be in the same transaction — no rollback protection
    }
}

// FIX — make it public and in a separate bean, or merge into the calling public method
@Transactional
public void processPayment(Payment payment) {
    paymentRepository.save(payment);
    ledgerRepository.addEntry(payment);
}
```

## When to Reach For This

- Any service method that writes to two or more tables — always wrap in `@Transactional`
- Financial operations (debit/credit, inventory/order) — atomicity is non-negotiable
- Audit logging that must survive a rollback — use `REQUIRES_NEW` propagation
- Read-heavy endpoints where Hibernate dirty-checking overhead matters — `readOnly = true`
- Any method that throws a checked exception and does DB writes — add `rollbackFor = Exception.class`
