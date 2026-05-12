---
title: "DTOs & Request/Response Mapping"
version: "Spring Boot 3.x"
since: 2003
stable: true
---

## The Problem

```java
// Returning the @Entity directly — dangerous
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userRepository.findById(id).orElseThrow();
    // PROBLEM 1: Returns password hash to the client
    // PROBLEM 2: Lazy-loaded @OneToMany collections → Jackson tries to serialize →
    //            LazyInitializationException or infinite recursion
    // PROBLEM 3: DB column names leak into your API contract
    // PROBLEM 4: Adding a new DB column automatically changes the API response
}
```

Returning entities directly couples your API contract to your database schema. Change the schema → break the API. Add a field → expose it to every client.

## Mental Model

A DTO is a travel adapter. Your internal model (the entity) doesn't leave the building — you transform it into a DTO for the journey over the wire. The entity is your internal language; the DTO is the public contract.

## Request DTO — What Comes In

```java
// Java Record — immutable, concise, perfect for DTOs (Java 16+)
public record CreateUserRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50)
    String name,

    @NotBlank
    @Email(message = "Must be a valid email")
    String email,

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password
) {}
```

## Response DTO — What Goes Out

```java
// Response DTO never includes password or sensitive fields
public record UserResponse(
    Long id,
    String name,
    String email,
    String role,
    LocalDateTime createdAt
) {
    // Factory method: converts entity to DTO — keeps mapping logic in one place
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
```

## Mapping in the Service

```java
@Service
public class UserService {
    public UserResponse create(CreateUserRequest request) {
        // Map DTO → Entity for persistence
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        User saved = userRepository.save(user);

        // Map Entity → DTO for response — never return entity from service
        return UserResponse.from(saved);
    }

    public List<UserResponse> findAll() {
        return userRepository.findAll()
            .stream()
            .map(UserResponse::from)
            .toList();
    }
}
```

## MapStruct — Automated Mapping (for larger DTOs)

```java
// MapStruct generates the implementation at compile time — no reflection
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);  // Fields matched by name automatically
    User toEntity(CreateUserRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntity(@MappingTarget User user, UpdateUserRequest request);
}
```

## Common Mistake

Returning the entity directly from the controller — the entity's lazy collections cause serialization errors or expose sensitive data:

```java
// WRONG — entity returned directly
@GetMapping("/{id}")
public User getUser(@PathVariable Long id) {
    return userRepository.findById(id).orElseThrow();
    // jackson tries to serialize orders (lazy collection) → error
    // password hash is exposed in the response
}

// RIGHT — map to DTO before returning
@GetMapping("/{id}")
public UserResponse getUser(@PathVariable Long id) {
    User user = userRepository.findById(id).orElseThrow(
        () -> new ResourceNotFoundException("User not found"));
    return UserResponse.from(user);
}
```

## When to Reach For This

- Every API endpoint that returns data — always map to a response DTO
- Every endpoint that accepts data — always map from a request DTO with validation
- When API response shape differs from entity structure (rename fields, omit fields, combine fields)
- When multiple endpoints return different views of the same entity (UserSummary vs UserDetail)
- When entity changes shouldn't automatically change the API contract
