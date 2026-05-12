// PAGINATION & SORTING — Solution

package com.example.issuetracker.controller;

import com.example.issuetracker.dto.UserResponse;
import com.example.issuetracker.model.User;
import com.example.issuetracker.service.UserService;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

// ─── Task 1: Repository with pagination ──────────────────────────────────────
public interface UserRepository extends JpaRepository<User, Long> {
    // Extending JpaRepository already gives findAll(Pageable) for free

    // Filtered + paginated
    Page<User> findByRole(String role, Pageable pageable);

    // Search + paginated (case-insensitive)
    Page<User> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Combined filter + search + paginated
    Page<User> findByRoleAndNameContainingIgnoreCase(String role, String name, Pageable pageable);
}

// ─── Tasks 2, 3, 4: Controller ───────────────────────────────────────────────
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Task 2: Paginated user list
    // GET /api/users?page=0&size=20&sort=name,asc
    // @PageableDefault provides defaults if client doesn't specify
    @GetMapping
    public Page<UserResponse> getUsers(
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        // Page.map() transforms the content while preserving all metadata
        // (totalElements, totalPages, hasNext, etc.)
        return userRepository.findAll(pageable).map(UserResponse::from);
    }

    // Task 3: Filter by role + paginate
    // GET /api/users/role/ADMIN?page=0&size=10&sort=createdAt,desc
    @GetMapping("/role/{role}")
    public Page<UserResponse> getByRole(
            @PathVariable String role,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        return userRepository.findByRole(role, pageable).map(UserResponse::from);
    }

    // Task 4: Search by name + paginate
    // GET /api/users/search?name=alice&page=0&size=10
    @GetMapping("/search")
    public Page<UserResponse> search(
            @RequestParam String name,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        return userRepository
            .findByNameContainingIgnoreCase(name, pageable)
            .map(UserResponse::from);
    }
}

// ─── Response structure example ───────────────────────────────────────────────
/*
GET /api/users?page=0&size=3&sort=name,asc

{
  "content": [
    { "id": 1, "name": "Alice", "email": "alice@example.com" },
    { "id": 3, "name": "Bob", "email": "bob@example.com" },
    { "id": 2, "name": "Charlie", "email": "charlie@example.com" }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 3,
    "sort": { "sorted": true, "orders": [{ "property": "name", "direction": "ASC" }] }
  },
  "totalElements": 9,
  "totalPages": 3,
  "first": true,
  "last": false,
  "numberOfElements": 3,
  "empty": false
}

The client uses:
  totalPages → how many page buttons to render
  hasNext / isLast → whether to show "Next" button
  totalElements → "Showing 9 results"
*/
