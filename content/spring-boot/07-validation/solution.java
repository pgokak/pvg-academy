// BEAN VALIDATION — Solution

package com.example.issuetracker.validation;

import jakarta.validation.*;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.lang.annotation.*;
import java.util.HashMap;
import java.util.Map;

// ─── Task 4: Custom constraint annotation ─────────────────────────────────────
@Documented
@Constraint(validatedBy = StrongPasswordValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface StrongPassword {
    String message() default "Password must contain at least one uppercase letter and one digit";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// Validator implementation — checks the constraint rules
public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {
    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) return true; // Let @NotBlank handle null check
        // Must have at least one uppercase AND one digit
        return password.matches(".*[A-Z].*") && password.matches(".*[0-9].*");
    }
}

// ─── Task 1: Annotated DTO ────────────────────────────────────────────────────
public record CreateUserRequest(

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @StrongPassword
    String password,

    @NotNull(message = "Age is required")
    @Min(value = 18, message = "Must be at least 18 years old")
    @Max(value = 120, message = "Invalid age value")
    Integer age,

    // Optional field — null is allowed; if provided, must be a valid URL
    @Pattern(
        regexp = "^(https?://).*",
        message = "Website must start with http:// or https://",
        flags = Pattern.Flag.CASE_INSENSITIVE
    )
    String website
) {}

// ─── Task 2: Controller ───────────────────────────────────────────────────────
/*
@RestController
@RequestMapping("/api/users")
public class UserController {
    @PostMapping
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody CreateUserRequest request) {
        // MethodArgumentNotValidException thrown before this runs if validation fails
        UserResponse created = userService.create(request);
        URI location = URI.create("/api/users/" + created.id());
        return ResponseEntity.created(location).body(created);
    }
}
*/

// ─── Task 3: Global validation error handler ──────────────────────────────────
@ControllerAdvice
public class ValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(
            MethodArgumentNotValidException ex) {

        // Collect ALL field errors (not just the first one)
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            // putIfAbsent keeps the first error for each field
            fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage())
        );

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Validation Failed");
        problem.setDetail("One or more fields have invalid values");
        problem.setProperty("errors", fieldErrors);

        return ResponseEntity.badRequest().body(problem);
    }
}

/*
Example 400 response when name is blank and password is weak:
{
  "title": "Validation Failed",
  "status": 400,
  "detail": "One or more fields have invalid values",
  "errors": {
    "name": "Name is required",
    "password": "Password must contain at least one uppercase letter and one digit"
  }
}
*/
