// JPA RELATIONSHIPS — Starter Exercise
//
// TASK: Define the relationship between User and Order entities.
//
// YOUR TASKS:
// 1. Add @OneToMany on User.orders — with mappedBy, cascade=ALL, fetch=LAZY
// 2. Add @ManyToOne on Order.user — with @JoinColumn, fetch=LAZY
// 3. Add a helper method addOrder(Order o) on User to maintain the bidirectional link
// 4. Fix UserRepository: add findByIdWithOrders() using @EntityGraph to avoid N+1
// 5. Fix OrderRepository: add findByUserId(Long userId) → List<Order>
// 6. In the comments, explain what N+1 problem means and how @EntityGraph fixes it

package com.example.issuetracker.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

// ─── Task 1 & 3: User entity ─────────────────────────────────────────────────
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;

    // TODO: Add @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders = new ArrayList<>();

    // TODO: Add helper method addOrder(Order o) that:
    //   - Adds o to this.orders
    //   - Sets o.setUser(this)  (maintains the bidirectional link)

    // Getters/setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public List<Order> getOrders() { return orders; }
    public void setName(String n) { this.name = n; }
    public void setEmail(String e) { this.email = e; }
}

// ─── Task 2: Order entity ─────────────────────────────────────────────────────
@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private BigDecimal total;
    private LocalDateTime createdAt;

    // TODO: Add @ManyToOne(fetch = FetchType.LAZY)
    // TODO: Add @JoinColumn(name = "user_id")
    private User user;  // Foreign key lives in the orders table

    // Getters/setters
    public Long getId() { return id; }
    public BigDecimal getTotal() { return total; }
    public User getUser() { return user; }
    public void setUser(User u) { this.user = u; }
    public void setTotal(BigDecimal t) { this.total = t; }
    public void setCreatedAt(LocalDateTime c) { this.createdAt = c; }
}

// ─── Tasks 4 & 5: Repositories ───────────────────────────────────────────────
// public interface UserRepository extends JpaRepository<User, Long> {
//     // TODO: Add findByIdWithOrders using @EntityGraph(attributePaths = {"orders"})
// }
//
// public interface OrderRepository extends JpaRepository<Order, Long> {
//     // TODO: Add findByUserId(Long userId) → List<Order>
// }

// ─── Task 6: Explanation ─────────────────────────────────────────────────────
// TODO: In a comment, explain:
// - What the N+1 problem is (give an example with 100 users)
// - How @EntityGraph solves it (what SQL does it generate?)
