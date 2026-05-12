// PAGINATION & SORTING — Starter Exercise
//
// TASK: Add pagination to the UserRepository and UserController.
//
// YOUR TASKS:
// 1. In UserRepository: change findAll() return type to accept Pageable
//    Add: findByRole(String role, Pageable pageable) → Page<User>
//    Add: findByNameContainingIgnoreCase(String name, Pageable pageable) → Page<User>
//
// 2. In UserController.getUsers(): change to accept Pageable parameter
//    Use @PageableDefault(size = 20, sort = "name")
//    Return Page<UserResponse> (use .map() to transform)
//
// 3. In UserController: add getByRole() endpoint
//    GET /api/users/role/{role}?page=0&size=10&sort=name,asc
//    Returns Page<UserResponse>
//
// 4. In UserController: add search() endpoint
//    GET /api/users/search?name=alice&page=0&size=10
//    Returns Page<UserResponse>

package com.example.issuetracker.controller;

import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

// ─── Task 1: Repository ───────────────────────────────────────────────────────
// public interface UserRepository extends JpaRepository<User, Long> {
//     // TODO: findByRole with Pageable
//     // TODO: findByNameContainingIgnoreCase with Pageable
// }

// ─── Tasks 2, 3, 4: Controller ───────────────────────────────────────────────
// @RestController @RequestMapping("/api/users")
// public class UserController {
//
//     // TODO: Task 2 — paginated getUsers
//     @GetMapping
//     public /* TODO */ getUsers(/* TODO: @PageableDefault Pageable */) {
//         // TODO: return userService.findAll(pageable).map(UserResponse::from)
//     }
//
//     // TODO: Task 3 — by role
//     @GetMapping("/role/{role}")
//     public /* TODO */ getByRole(
//             @PathVariable String role,
//             /* TODO: Pageable */) {
//         // TODO
//     }
//
//     // TODO: Task 4 — search by name
//     @GetMapping("/search")
//     public /* TODO */ search(
//             @RequestParam String name,
//             /* TODO: @PageableDefault(size = 10) Pageable */) {
//         // TODO
//     }
// }

// ─── Example API calls this should support ───────────────────────────────────
// GET /api/users                              → page 0, 20 items, sorted by name
// GET /api/users?page=2&size=5               → page 2, 5 items
// GET /api/users?sort=createdAt,desc         → sorted by date descending
// GET /api/users/role/ADMIN?page=0&size=10   → admins, paginated
// GET /api/users/search?name=alice&page=0    → search, paginated
