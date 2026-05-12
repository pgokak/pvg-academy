---
title: "Bean Validation"
version: "Spring Boot 3.x"
since: 2009
stable: true
---

## The Problem

```java
@Service
public class UserService {
    public User create(CreateUserRequest req) {
        // Manual validation duplicated in every method that receives user data
        if (req.getName() == null || req.getName().isBlank()) throw new IllegalArgumentException("Name required");
        if (req.getName().length() < 2 || req.getName().length() > 50) throw new IllegalArgumentException("Name 2-50 chars");
        if (req.getEmail() == null || !req.getEmail().matches("^[\\w.-]+@[\\w.-]+\\.[a-z]{2,}$")) throw new IllegalArgumentException("Invalid email");
        if (req.getPassword() == null || req.getPassword().length() < 8) throw new IllegalArgumentException("Password min 8 chars");
        // ...same checks in updateUser(), importUsers(), adminCreateUser()...
    }
}
```

Rules duplicated across multiple methods. Change one rule → must find every copy.

## Mental Model

Bean Validation is a contract on your data. Annotate the class once; Spring enforces it at every entry point automatically. The bouncer is at the door — you don't check IDs at every table inside.

## Constraint Annotations

```java
public record CreateUserRequest(
    @NotNull(message = "Name cannot be null")
    @NotBlank(message = "Name cannot be blank")    // NotBlank implies NotNull
    @Size(min = 2, max = 50, message = "Name must be 2-50 characters")
    String name,

    @NotBlank
    @Email(message = "Must be a valid email address")
    String email,

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = ".*[A-Z].*", message = "Password must contain at least one uppercase letter")
    String password,

    @NotNull
    @Min(value = 18, message = "Must be 18 or older")
    @Max(value = 120, message = "Invalid age")
    Integer age,

    @Positive(message = "Balance must be positive")
    BigDecimal initialBalance
) {}
```

## Triggering Validation

```java
// @Valid on @RequestBody → validates the DTO when request arrives
@PostMapping("/users")
public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
    // If validation fails, Spring throws MethodArgumentNotValidException
    // before this method body runs — your @ControllerAdvice handles it
    return ResponseEntity.status(201).body(userService.create(request));
}

// @Validated on the class → enables method-level validation (path vars, query params)
@RestController
@Validated
public class UserController {
    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable @Min(1) Long id) { ... }
}
```

## Custom Constraint Annotation

```java
// 1. Define the annotation
@Documented
@Constraint(validatedBy = UniqueEmailValidator.class)
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface UniqueEmail {
    String message() default "Email is already registered";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// 2. Implement the validator
@Component
public class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {
    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean isValid(String email, ConstraintValidatorContext ctx) {
        if (email == null) return true; // Let @NotBlank handle null
        return !userRepository.existsByEmail(email);
    }
}

// 3. Use it
public record CreateUserRequest(
    @UniqueEmail
    @Email
    String email
) {}
```

## Common Mistake

Putting validation in the service layer instead of at the entry boundary:

```java
// WRONG — validation in the service
@Service
public class UserService {
    public User create(CreateUserRequest req) {
        if (req.getEmail() == null) throw new IllegalArgumentException("Email required");
        // ... more manual checks
    }
}
// The validation runs, but:
// - Errors are a single exception with one message (not a list of all errors)
// - Client gets a 500 instead of a 400 with field details
// - Rules are hidden inside the service, not on the DTO

// RIGHT — annotations on the DTO, @Valid at the controller
public record CreateUserRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8) String password
) {}
// Controller: @Valid @RequestBody CreateUserRequest req
// All validation errors collected at once → 400 with structured field error list
```

## When to Reach For This

- Every request DTO that enters your API — annotate fields with constraints
- When multiple endpoints accept the same DTO — define rules once, enforced everywhere
- When you need structured field-level error responses — combine with `@ControllerAdvice` + `MethodArgumentNotValidException`
- Path variables and query params need validation too — use `@Validated` on the controller class
- Business-rule validations that query the database (uniqueness, foreign key existence) — create custom constraint annotations
