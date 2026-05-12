// REST CONTROLLERS — Solution

package com.example.issuetracker.controller;

import com.example.issuetracker.dto.CreateUserRequest;
import com.example.issuetracker.dto.UpdateUserRequest;
import com.example.issuetracker.dto.UserResponse;
import com.example.issuetracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController                        // @Controller + @ResponseBody on every method
@RequestMapping("/api/users")          // All paths in this controller start with /api/users
public class UserController {

    private final UserService userService;

    // Constructor injection — no @Autowired needed with single constructor
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users → 200 OK with JSON array
    @GetMapping
    public List<UserResponse> getAll() {
        return userService.findAll();
    }

    // GET /api/users/42 → 200 OK or 404 Not Found (thrown by service)
    @GetMapping("/{id}")
    public UserResponse getOne(@PathVariable Long id) {
        return userService.findById(id);
    }

    // POST /api/users → 201 Created with Location header pointing to new resource
    // @Valid triggers Bean Validation on CreateUserRequest fields
    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        UserResponse created = userService.create(request);
        URI location = URI.create("/api/users/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    // PUT /api/users/42 → 200 OK with updated resource (full replacement)
    @PutMapping("/{id}")
    public UserResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }

    // DELETE /api/users/42 → 204 No Content (no body in response)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/users/search?email=alice@example.com
    // @RequestParam(required = false) makes the param optional
    // defaultValue provides a fallback if not supplied
    @GetMapping("/search")
    public UserResponse findByEmail(
            @RequestParam String email) {
        return userService.findByEmail(email);
    }
}

// ─── Supporting record DTOs ───────────────────────────────────────────────────
/*
package com.example.issuetracker.dto;

// Records are immutable, concise, and ideal for DTOs
public record CreateUserRequest(
    @NotBlank(message = "Name is required") String name,
    @Email @NotBlank(message = "Valid email required") String email,
    @NotBlank @Size(min = 8) String password
) {}

public record UpdateUserRequest(
    @NotBlank String name,
    String role
) {}

public record UserResponse(
    Long id,
    String name,
    String email,
    String role
) {
    // Factory method to convert from entity
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
*/
