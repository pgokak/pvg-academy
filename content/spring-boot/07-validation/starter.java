// BEAN VALIDATION — Starter Exercise
//
// TASK: Add Bean Validation to a registration endpoint.
//
// YOUR TASKS:
// 1. Add constraint annotations to CreateUserRequest:
//    - name: required, 2-50 chars
//    - email: required, valid email format
//    - password: required, min 8 chars
//    - age: required, min 18, max 120
//    - website: optional, must be a valid URL if provided
// 2. Add @Valid to the controller method parameter
// 3. Write a @ControllerAdvice handler for MethodArgumentNotValidException
//    that returns 400 with a map of { fieldName: errorMessage }
// 4. Create a custom @StrongPassword annotation that validates:
//    - At least one uppercase letter
//    - At least one digit
//    - At least 8 characters total

package com.example.issuetracker.dto;

import jakarta.validation.constraints.*;

// ─── Task 1: Add constraints to this record ───────────────────────────────────
public record CreateUserRequest(
    // TODO: @NotBlank + @Size(min = 2, max = 50)
    String name,

    // TODO: @NotBlank + @Email
    String email,

    // TODO: @NotBlank + @Size(min = 8) + @StrongPassword (Task 4)
    String password,

    // TODO: @NotNull + @Min(18) + @Max(120)
    Integer age,

    // TODO: @URL (or @Pattern) — optional, nullable
    String website
) {}

// ─── Task 2: Controller — add @Valid ─────────────────────────────────────────
// @RestController @RequestMapping("/api/users")
// public class UserController {
//     @PostMapping
//     public ResponseEntity<UserResponse> register(
//             /* TODO: add @Valid */ @RequestBody CreateUserRequest request) {
//         // ...
//     }
// }

// ─── Task 3: Validation error handler ────────────────────────────────────────
// @ControllerAdvice
// public class ValidationHandler {
//     @ExceptionHandler(MethodArgumentNotValidException.class)
//     public ResponseEntity<???> handleValidation(MethodArgumentNotValidException ex) {
//         // TODO: extract field errors into Map<String, String>
//         // Return 400 Bad Request with the map as body
//     }
// }

// ─── Task 4: Custom @StrongPassword annotation ───────────────────────────────
// Validates: at least 1 uppercase, at least 1 digit, at least 8 chars total
// TODO: Create the annotation @StrongPassword
// TODO: Create StrongPasswordValidator implements ConstraintValidator<StrongPassword, String>
