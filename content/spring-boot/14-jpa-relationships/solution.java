// JPA RELATIONSHIPS — Solution

package com.example.issuetracker.model;

import jakarta.persistence.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

// ─── Task 1 & 3: User entity ─────────────────────────────────────────────────
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;

    // mappedBy = "user" means Order.user owns the relationship (has the FK column)
    // cascade = ALL: persist/merge/remove User also cascades to Orders
    // fetch = LAZY: orders list is NOT loaded until getOrders() is called
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    // Bidirectional helper — always use this to add orders, not orders.add()
    // Keeps both sides of the relationship in sync in memory
    public void addOrder(Order order) {
        orders.add(order);
        order.setUser(this); // Critical: tells Order which User it belongs to
    }

    public void removeOrder(Order order) {
        orders.remove(order);
        order.setUser(null);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public List<Order> getOrders() { return Collections.unmodifiableList(orders); }
    public void setName(String n) { this.name = n; }
    public void setEmail(String e) { this.email = e; }
}

// ─── Task 2: Order entity ─────────────────────────────────────────────────────
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private BigDecimal total;
    private LocalDateTime createdAt;

    // LAZY prevents loading the User entity just because you loaded an Order
    // The FK column user_id lives in the orders table (the "many" side)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Long getId() { return id; }
    public BigDecimal getTotal() { return total; }
    public User getUser() { return user; }
    public void setUser(User u) { this.user = u; }
    public void setTotal(BigDecimal t) { this.total = t; }
    public void setCreatedAt(LocalDateTime c) { this.createdAt = c; }
}

// ─── Tasks 4 & 5: Repositories ───────────────────────────────────────────────
interface UserRepository extends JpaRepository<User, Long> {
    // @EntityGraph tells JPA to include the orders collection in the initial query
    // SQL: SELECT u.*, o.* FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.id = ?
    // Without @EntityGraph: SELECT * FROM users WHERE id = ?
    //                        then: SELECT * FROM orders WHERE user_id = ? (separate query)
    @EntityGraph(attributePaths = {"orders"})
    Optional<User> findByIdWithOrders(Long id);
}

interface OrderRepository extends JpaRepository<Order, Long> {
    // Derived query: WHERE user_id = ?
    List<Order> findByUserId(Long userId);

    // Paginated
    org.springframework.data.domain.Page<Order> findByUserId(
        Long userId, org.springframework.data.domain.Pageable pageable);
}

// ─── Task 6: N+1 Explanation ─────────────────────────────────────────────────
/*
THE N+1 PROBLEM:
  Without @EntityGraph or JOIN FETCH:

  userRepository.findAll() generates:
    SELECT * FROM users                          → 1 query, returns 100 users

  Then accessing user.getOrders() for each user:
    SELECT * FROM orders WHERE user_id = 1      → 1 query
    SELECT * FROM orders WHERE user_id = 2      → 1 query
    ...
    SELECT * FROM orders WHERE user_id = 100    → 1 query

  Total: 101 queries for 100 users. "1 + N" = N+1 problem.
  For 10,000 users: 10,001 round-trips to the database!

HOW @EntityGraph FIXES IT:
  @EntityGraph(attributePaths = {"orders"}) changes the query to:
    SELECT u.*, o.* FROM users u
    LEFT JOIN orders o ON u.id = o.user_id    → 1 query, everything in one JOIN

  JPA assembles the User objects and their Order lists from the single result set.
  Total: 1 query regardless of how many users. N+1 → 1.

HOW JOIN FETCH FIXES IT (JPQL alternative):
  @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.orders")
  List<User> findAllWithOrders();
  // Also generates a single JOIN query
*/
