// SPRING DATA JPA — Solution

package com.example.issuetracker.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// ─── Task 1: Entity ───────────────────────────────────────────────────────────
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

    @Column(nullable = false)
    private String role = "USER";

    @Column(nullable = false)
    private boolean active = true;

    // Hibernate-specific: automatically sets the timestamp when entity is first saved
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public User() {}

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setRole(String role) { this.role = role; }
    public void setActive(boolean active) { this.active = active; }
}

// ─── Task 2 & 3: Repository ───────────────────────────────────────────────────
// Extending JpaRepository<User, Long> gives: save, findById, findAll, delete,
// count, existsById, saveAll, deleteAll, and more — all implemented automatically

public interface UserRepository extends JpaRepository<User, Long> {

    // Derived from method name: WHERE email = ?
    Optional<User> findByEmail(String email);

    // Derived: WHERE active = true
    List<User> findByActiveTrue();

    // Derived: WHERE role = ? AND active = true
    List<User> findByRoleAndActiveTrue(String role);

    // Derived: SELECT COUNT(*) > 0 WHERE email = ?
    boolean existsByEmail(String email);

    // Derived: WHERE LOWER(name) LIKE LOWER('%?%')
    List<User> findByNameContainingIgnoreCase(String namePart);

    // Task 3: Custom JPQL query — more expressive than a method name
    // :date and :role are named parameters bound via @Param
    @Query("SELECT u FROM User u WHERE u.createdAt > :date AND u.role = :role ORDER BY u.name")
    List<User> findUsersCreatedAfterWithRole(
            @Param("date") LocalDateTime date,
            @Param("role") String role);
}

// ─── Service using the repository ────────────────────────────────────────────
/*
@Service
@Transactional(readOnly = true)  // Default read-only — override on write methods
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse findById(Long id) {
        return userRepository.findById(id)
            .map(UserResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Transactional  // Override — this method modifies data
    public UserResponse create(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ConflictException("Email already registered: " + req.email());
        }
        User user = new User(req.name(), req.email());
        User saved = userRepository.save(user);
        return UserResponse.from(saved);
    }
}
*/
