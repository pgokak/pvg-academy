// DTOs & MAPPING — Solution

package com.example.issuetracker.dto;

import com.example.issuetracker.model.User;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

// ─── Task 1: Response DTO ─────────────────────────────────────────────────────
// Records are immutable and concise — perfect for DTOs
// passwordHash is intentionally excluded — never expose it
public record UserResponse(
    Long id,
    String name,
    String email,
    String role,
    LocalDateTime createdAt
) {
    // Factory method: mapping lives close to the DTO, not scattered in services
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.getCreatedAt()
        );
    }
}

// ─── Task 2: Create Request ───────────────────────────────────────────────────
public record CreateUserRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be 2-50 characters")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password
) {}

// ─── Task 3: Update Request ───────────────────────────────────────────────────
public record UpdateUserRequest(
    @Size(min = 2, max = 50)
    String name,   // null means "don't change"

    @Pattern(regexp = "USER|ADMIN|MODERATOR", message = "Invalid role")
    String role
) {}

// ─── Task 4: Fixed controller ─────────────────────────────────────────────────
/*
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        // Returns DTO, never entity — API contract is decoupled from DB schema
        return userService.findById(id);
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse created = userService.create(request);
        URI location = URI.create("/api/users/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }
}
*/

// ─── Task 5: Fixed service ────────────────────────────────────────────────────
/*
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse create(CreateUserRequest request) {
        // Check for duplicate email before creating
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered: " + request.email());
        }

        // Map Request DTO → Entity
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        // role and createdAt have defaults — don't need to set them

        User saved = userRepository.save(user);

        // Map Entity → Response DTO — never return entity from service
        return UserResponse.from(saved);
    }

    public UserResponse findById(Long id) {
        return userRepository.findById(id)
            .map(UserResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
            .map(UserResponse::from)
            .toList();
    }
}
*/
