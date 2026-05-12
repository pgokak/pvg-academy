// EXCEPTION HANDLING — Starter Exercise
//
// TASK: Replace scattered try/catch with a proper @ControllerAdvice setup.
//
// YOUR TASKS:
// 1. Create ResourceNotFoundException extending RuntimeException
// 2. Create ConflictException extending RuntimeException
// 3. Create GlobalExceptionHandler (@ControllerAdvice) with handlers for:
//    a. ResourceNotFoundException → 404 ProblemDetail
//    b. ConflictException → 409 ProblemDetail
//    c. MethodArgumentNotValidException → 400 ProblemDetail with field errors map
//    d. Exception (catch-all) → 500 ProblemDetail (log the real error)
// 4. Fix UserController to remove try/catch — let exceptions propagate
// 5. Fix UserService to throw ResourceNotFoundException instead of returning null

package com.example.issuetracker.exception;

// ─── Task 1: ResourceNotFoundException ───────────────────────────────────────
// TODO: Create ResourceNotFoundException extends RuntimeException

// ─── Task 2: ConflictException ────────────────────────────────────────────────
// TODO: Create ConflictException extends RuntimeException

// ─── Task 3: GlobalExceptionHandler ──────────────────────────────────────────
// TODO: Implement the @ControllerAdvice class with all four handlers

// ─── Task 4: Fix the controller (remove try/catch) ────────────────────────────
// @RestController @RequestMapping("/api/users")
// class UserController {
//     @GetMapping("/{id}")
//     public UserResponse getUser(@PathVariable Long id) {
//         try {
//             return userService.findById(id);  // TODO: remove try/catch — let it propagate
//         } catch (Exception e) {
//             return null;  // BAD: returns 200 with null body
//         }
//     }
//
//     @PostMapping
//     public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
//         try {
//             UserResponse created = userService.create(req);
//             return ResponseEntity.ok(created);   // TODO: should be 201 Created
//         } catch (Exception e) {
//             throw new RuntimeException("Something went wrong: " + e.getMessage());
//         }
//     }
// }

// ─── Task 5: Fix the service (throw proper exceptions) ───────────────────────
// class UserService {
//     public UserResponse findById(Long id) {
//         User user = userRepository.findById(id).orElse(null);
//         if (user == null) return null;   // TODO: throw ResourceNotFoundException instead
//         return UserResponse.from(user);
//     }
//
//     public UserResponse create(CreateUserRequest req) {
//         User existing = userRepository.findByEmail(req.email()).orElse(null);
//         if (existing != null) return null;  // TODO: throw ConflictException instead
//         // ...
//     }
// }
