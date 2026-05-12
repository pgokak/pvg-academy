// REST CONTROLLERS — Starter Exercise
//
// TASK: Complete the UserController with all required HTTP endpoints.
// The UserService is already implemented — you only need to wire the controller.
//
// YOUR TASKS:
// 1. Add @RestController and @RequestMapping("/api/users") to the class
// 2. Implement GET /api/users → returns all users (200 OK)
// 3. Implement GET /api/users/{id} → returns one user (200 OK) or 404
// 4. Implement POST /api/users → creates user, returns 201 Created with Location header
// 5. Implement PUT /api/users/{id} → full update, returns updated user (200 OK)
// 6. Implement DELETE /api/users/{id} → deletes user, returns 204 No Content
// 7. Implement GET /api/users/search?email=alice@example.com → find by email

package com.example.issuetracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.net.URI;
import java.util.List;

// TODO: Add class-level annotations

public class UserController {

    private final UserService userService;

    // TODO: Constructor injection
    public UserController(/* TODO */) { }

    // TODO: GET /api/users
    // Returns: List<UserResponse> with 200 OK
    public /* TODO return type */ getAll() {
        // TODO
    }

    // TODO: GET /api/users/{id}
    // Returns: UserResponse with 200 OK
    // Throws: ResourceNotFoundException if user not found (→ 404)
    public /* TODO return type */ getOne(/* TODO param */) {
        // TODO
    }

    // TODO: POST /api/users
    // Accepts: @Valid CreateUserRequest in request body
    // Returns: ResponseEntity with 201 Created + Location: /api/users/{newId}
    public /* TODO return type */ create(/* TODO params */) {
        // TODO
    }

    // TODO: PUT /api/users/{id}
    // Accepts: @Valid UpdateUserRequest in request body, {id} in path
    // Returns: updated UserResponse with 200 OK
    public /* TODO return type */ update(/* TODO params */) {
        // TODO
    }

    // TODO: DELETE /api/users/{id}
    // Returns: ResponseEntity<Void> with 204 No Content
    public /* TODO return type */ delete(/* TODO param */) {
        // TODO
    }

    // TODO: GET /api/users/search?email=...
    // Uses @RequestParam for the email query parameter
    // Returns: UserResponse or 404 if not found
    public /* TODO return type */ findByEmail(/* TODO param */) {
        // TODO
    }
}

// ─── Supporting classes (already implemented, shown for reference) ────────────
// record CreateUserRequest(@NotBlank String name, @Email String email, @NotBlank String password) {}
// record UpdateUserRequest(@NotBlank String name, String role) {}
// record UserResponse(Long id, String name, String email, String role) {}
//
// @Service class UserService {
//   List<UserResponse> findAll() { ... }
//   UserResponse findById(Long id) { ... } // throws ResourceNotFoundException
//   UserResponse create(CreateUserRequest req) { ... }
//   UserResponse update(Long id, UpdateUserRequest req) { ... }
//   void delete(Long id) { ... }
//   UserResponse findByEmail(String email) { ... }
// }
