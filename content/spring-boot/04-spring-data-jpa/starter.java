// SPRING DATA JPA — Starter Exercise
//
// TASK: Complete the User entity and UserRepository.
//
// YOUR TASKS:
// 1. Add JPA annotations to the User entity:
//    - @Entity + @Table(name = "users")
//    - @Id + @GeneratedValue on the id field
//    - @Column constraints on name (not null, max 100) and email (unique, not null)
//    - @CreationTimestamp on createdAt (Hibernate annotation)
//
// 2. Make UserRepository extend JpaRepository<User, Long>
//    Then add these derived query methods:
//    a. findByEmail(String email) → Optional<User>
//    b. findByActiveTrue() → List<User>
//    c. findByRoleAndActiveTrue(String role) → List<User>
//    d. existsByEmail(String email) → boolean
//    e. findByNameContainingIgnoreCase(String namePart) → List<User>
//
// 3. Add a @Query method:
//    findUsersCreatedAfterWithRole(LocalDateTime date, String role) → List<User>
//    Use JPQL: SELECT u FROM User u WHERE u.createdAt > :date AND u.role = :role

package com.example.issuetracker.model;

import java.time.LocalDateTime;

// TODO: Add @Entity and @Table annotations
public class User {

    // TODO: Add @Id and @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO: Add @Column(nullable = false, length = 100)
    private String name;

    // TODO: Add @Column(unique = true, nullable = false)
    private String email;

    private String role = "USER";
    private boolean active = true;

    // TODO: Add @CreationTimestamp or @Column + @PrePersist
    private LocalDateTime createdAt;

    // Constructors, getters, setters
    public User() {}

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    // TODO: Add getters and setters (or use Lombok @Data)
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setRole(String role) { this.role = role; }
    public void setActive(boolean active) { this.active = active; }
}

// ─── Repository ───────────────────────────────────────────────────────────────
// package com.example.issuetracker.repository;
//
// TODO: Make this extend JpaRepository<User, Long>
// TODO: Add the 5 derived query methods
// TODO: Add the @Query method
//
// public interface UserRepository {
//     // TODO: Add derived queries and @Query method here
// }
