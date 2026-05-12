---
title: "JPA Relationships"
version: "Spring Boot 3.x"
since: 2006
stable: true
---

## The Problem

```java
// Manual SQL joins — 60 lines for a simple user + orders query
public List<UserWithOrders> getUsersWithOrders() {
    String sql = "SELECT u.id, u.name, u.email, o.id as order_id, o.total " +
                 "FROM users u LEFT JOIN orders o ON u.id = o.user_id";
    try (Connection conn = dataSource.getConnection();
         PreparedStatement stmt = conn.prepareStatement(sql);
         ResultSet rs = stmt.executeQuery()) {
        Map<Long, UserWithOrders> map = new LinkedHashMap<>();
        while (rs.next()) {
            Long userId = rs.getLong("id");
            UserWithOrders u = map.computeIfAbsent(userId, id ->
                new UserWithOrders(id, rs.getString("name"), rs.getString("email"), new ArrayList<>()));
            if (rs.getLong("order_id") != 0) {
                u.orders().add(new Order(rs.getLong("order_id"), rs.getBigDecimal("total")));
            }
        }
        return new ArrayList<>(map.values());
    } catch (SQLException e) { throw new RuntimeException(e); }
}
```

## Mental Model

JPA relationships let Java objects reference each other naturally. Define the relationship once; JPA writes the JOIN for you. A User has a list of Orders — define that in Java and JPA translates it to a foreign key and JOIN query.

## @OneToMany and @ManyToOne — Most Common

```java
@Entity
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    // One user → many orders
    // mappedBy = "user" means Order.user is the owner of the relationship
    // cascade = PERSIST,MERGE: saving/updating User also saves/updates its Orders
    // fetch = LAZY: orders are NOT loaded until accessed (always use LAZY)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders = new ArrayList<>();
}

@Entity
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private BigDecimal total;

    // Many orders → one user
    // @JoinColumn creates the foreign key column in the orders table
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
```

## The N+1 Problem and How to Fix It

```java
// N+1 PROBLEM: 1 query for users + N queries for each user's orders
List<User> users = userRepository.findAll(); // 1 query: SELECT * FROM users
for (User user : users) {
    user.getOrders().size(); // N queries: SELECT * FROM orders WHERE user_id = ?
}
// For 100 users: 101 database round-trips!

// FIX 1: JOIN FETCH in JPQL
@Query("SELECT u FROM User u LEFT JOIN FETCH u.orders WHERE u.id = :id")
Optional<User> findByIdWithOrders(@Param("id") Long id);

// FIX 2: @EntityGraph — declarative, no JPQL needed
@EntityGraph(attributePaths = {"orders"})
List<User> findAll();
```

## @ManyToMany with Join Table

```java
@Entity
public class Student {
    @ManyToMany
    @JoinTable(
        name = "student_courses",         // Join table name
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private Set<Course> courses = new HashSet<>();
}

@Entity
public class Course {
    @ManyToMany(mappedBy = "courses")
    private Set<Student> students = new HashSet<>();
}
```

## Common Mistake

Using `FetchType.EAGER` — loads related entities even when you don't need them, causing performance issues:

```java
// WRONG — EAGER loads ALL orders for EVERY user, even if you just need user names
@OneToMany(fetch = FetchType.EAGER)  // Default for @OneToMany is LAZY — don't override!
private List<Order> orders;

// WRONG for @ManyToOne too — EAGER is actually the default for @ManyToOne!
@ManyToOne  // EAGER by default — explicitly make it LAZY
private User user;

// RIGHT — always explicit LAZY, use JOIN FETCH only when you need the data
@OneToMany(fetch = FetchType.LAZY)
private List<Order> orders;

@ManyToOne(fetch = FetchType.LAZY)  // Explicitly override the default
@JoinColumn(name = "user_id")
private User user;
```

## When to Reach For This

- Modeling parent-child data (User → Orders, Post → Comments) — use `@OneToMany`
- Loading a child and needing its parent (Order → User) — use `@ManyToOne`
- Many-to-many without extra attributes (Student → Courses) — use `@ManyToMany`
- Many-to-many with extra attributes (Enrollment has grade) — model as two `@OneToMany` through an explicit entity
- When you see N+1 slow queries — add `@EntityGraph` or `JOIN FETCH` on the query
