// DTOs & MAPPING — Starter Exercise
//
// TASK: Fix the controller to use DTOs instead of returning entities directly.
//
// YOUR TASKS:
// 1. Create a UserResponse record with: id, name, email, role, createdAt
//    Add a static factory method: UserResponse.from(User user)
// 2. Create a CreateUserRequest record with: name, email, password
//    Add validation annotations
// 3. Create an UpdateUserRequest record with: name (optional), role (optional)
// 4. Fix the UserController to use DTOs — never return User entity
// 5. Fix UserService.create() to map from request → entity, entity → response

package com.example.issuetracker;

import java.time.LocalDateTime;

// ─── The problematic entity (don't change this) ───────────────────────────────
// @Entity @Table(name = "users")
class User {
    Long id;
    String name;
    String email;
    String passwordHash; // Should NEVER be sent to clients!
    String role = "USER";
    LocalDateTime createdAt;
}

// ─── Task 1: UserResponse record ─────────────────────────────────────────────
// TODO: Create UserResponse record
// TODO: Add static from(User user) factory method

// ─── Task 2: CreateUserRequest record ────────────────────────────────────────
// TODO: Create CreateUserRequest record with validation annotations

// ─── Task 3: UpdateUserRequest record ────────────────────────────────────────
// TODO: Create UpdateUserRequest record

// ─── Task 4: Fix the controller ──────────────────────────────────────────────
// @RestController @RequestMapping("/api/users")
// class UserController {
//     private final UserService userService;
//     UserController(UserService userService) { this.userService = userService; }
//
//     // TODO: Fix return type from User to UserResponse
//     @GetMapping("/{id}")
//     public User getUser(@PathVariable Long id) {
//         return userService.findById(id); // returns User entity — FIX THIS
//     }
//
//     // TODO: Fix return type, fix param from User to CreateUserRequest
//     @PostMapping
//     public User createUser(@RequestBody User user) { // WRONG param type
//         return userService.create(user);
//     }
// }

// ─── Task 5: Fix the service ─────────────────────────────────────────────────
// class UserService {
//     // TODO: Change return type from User to UserResponse
//     // TODO: Add mapping: CreateUserRequest → User → UserResponse
//     public User create(User user) {
//         // Currently returns entity — fix this
//         user.passwordHash = hashPassword(user.passwordHash);
//         return userRepository.save(user);
//     }
// }
