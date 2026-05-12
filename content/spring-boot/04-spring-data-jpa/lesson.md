---
title: "Spring Data JPA"
version: "Spring Boot 3.x"
since: 2011
stable: true
---

## The Problem

```java
// JDBC boilerplate — 40 lines for a simple findById
public User findById(Long id) {
    String sql = "SELECT id, name, email, created_at FROM users WHERE id = ?";
    try (Connection conn = dataSource.getConnection();
         PreparedStatement stmt = conn.prepareStatement(sql)) {
        stmt.setLong(1, id);
        try (ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                User user = new User();
                user.setId(rs.getLong("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                return user;
            }
            return null;
        }
    } catch (SQLException e) {
        throw new RuntimeException("Failed to find user", e);
    }
}
```

That's one method. Multiply by every query in your application.

## Mental Model

JPA is a translator between Java objects and database rows. Spring Data JPA goes further — it generates the SQL from method names so you don't write it at all. Define the shape of your query as a Java method name; Spring writes the SQL at startup.

## Entity Mapping

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    // getters/setters or use Lombok @Data
}
```

## JpaRepository — Built-in CRUD

```java
// Extend JpaRepository<EntityType, IdType>
// You get 20+ methods for free — no implementation needed
public interface UserRepository extends JpaRepository<User, Long> {
    // Already have: findById, findAll, save, delete, count, existsById, etc.
}
```

## Derived Queries — SQL from Method Names

Spring Data JPA parses method names and generates the SQL:

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // SELECT * FROM users WHERE name LIKE '%?%'
    List<User> findByNameContaining(String namePart);

    // SELECT * FROM users WHERE role = ? AND active = true
    List<User> findByRoleAndActiveTrue(String role);

    // SELECT * FROM users WHERE created_at > ? ORDER BY name ASC
    List<User> findByCreatedAtAfterOrderByNameAsc(LocalDateTime date);

    // SELECT COUNT(*) FROM users WHERE role = ?
    long countByRole(String role);

    // SELECT * FROM users WHERE role = ? (with pagination)
    Page<User> findByRole(String role, Pageable pageable);
}
```

## @Query — Custom JPQL or SQL

When method names aren't expressive enough:

```java
// JPQL (Java-object syntax, not SQL)
@Query("SELECT u FROM User u WHERE u.email = :email AND u.active = true")
Optional<User> findActiveUserByEmail(@Param("email") String email);

// Native SQL
@Query(value = "SELECT * FROM users WHERE LOWER(name) LIKE LOWER(:name)", nativeQuery = true)
List<User> searchByNameCaseInsensitive(@Param("name") String name);

// Update query — requires @Modifying + @Transactional
@Modifying
@Transactional
@Query("UPDATE User u SET u.active = false WHERE u.lastLogin < :cutoff")
int deactivateInactiveUsers(@Param("cutoff") LocalDateTime cutoff);
```

## @Transactional

```java
@Service
public class UserService {
    // @Transactional ensures all operations complete or all roll back
    @Transactional
    public void transferAccount(Long fromId, Long toId) {
        User from = userRepository.findById(fromId).orElseThrow();
        User to = userRepository.findById(toId).orElseThrow();
        // If any exception occurs here, both updates are rolled back
        from.setBalance(from.getBalance() - 100);
        to.setBalance(to.getBalance() + 100);
        // Spring calls save() automatically for modified entities within a transaction
    }
}
```

## Common Mistake

Not using `Optional` for findById — getting a `null` when entity doesn't exist instead of a clean exception:

```java
// WRONG — findById returns Optional, not the entity directly
User user = userRepository.findById(id); // Compile error — returns Optional<User>

// WRONG — calling .get() without checking
User user = userRepository.findById(id).get(); // NoSuchElementException if missing

// RIGHT — handle the empty case explicitly
User user = userRepository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
```

## When to Reach For This

- Any application that reads or writes to a relational database
- Simple CRUD operations — `JpaRepository` gives you everything for free
- Queries based on field values — derived query methods (findByEmail, findByStatus)
- Complex queries — `@Query` with JPQL or native SQL
- Operations that must succeed or fail together — `@Transactional`
- When you need pagination and sorting — `Page<T>` + `Pageable`
