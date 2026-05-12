---
title: "Validation"
version: "Full-Stack"
since: 2003
stable: true
---

## The Problem

```java
// Spring controller — manual validation scattered everywhere
@PostMapping("/users")
public User createUser(@RequestBody UserRequest req) {
    // Manual checks in the controller
    if (req.getName() == null || req.getName().isBlank()) {
        throw new RuntimeException("Name is required");
    }
    if (req.getEmail() == null || !req.getEmail().contains("@")) {
        throw new RuntimeException("Invalid email");
    }
    // Same checks duplicated in the update endpoint...
    // And in the batch import endpoint...
    return userService.create(req);
}
```

```typescript
// Angular component — manual validation in the submit handler
onSubmit(): void {
  if (!this.name || this.name.length < 2) {
    this.nameError = 'Name must be at least 2 characters';
    return;
  }
  if (!this.email || !this.email.includes('@')) {
    this.emailError = 'Valid email required';
    return;
  }
  // Rules duplicated across 3 different forms
  this.userService.createUser({ name: this.name, email: this.email }).subscribe();
}
```

Same rules copy-pasted everywhere. Adding a new rule means finding every duplicate.

## Mental Model

Validation is a bouncer at the door. Define the rules once at the entry point — the DTO annotation or the FormControl validator. Don't check IDs inside the venue (service layer, component event handlers). Everyone passes through the same door.

## Side-by-Side: Spring Bean Validation vs Angular Reactive Forms

**Spring Boot — validate at the boundary (DTO):**

```java
public record CreateUserRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be 2-50 characters")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    String email,

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password,

    @Min(value = 18, message = "Must be 18 or older")
    @Max(value = 120, message = "Invalid age")
    Integer age
) {}

// Controller: just add @Valid — Spring runs all annotations automatically
@PostMapping("/users")
public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
    return ResponseEntity.status(201).body(userService.create(req));
}

// Handle validation errors centrally with @ControllerAdvice
@ControllerAdvice
public class ValidationExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
}
```

**Angular — FormGroup with Validators:**

```typescript
@Component({ template: `...` })
export class UserFormComponent {
  form = new FormGroup({
    name: new FormControl("", [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ]),
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
    ]),
    age: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(18),
      Validators.max(120),
    ]),
  });

  // Helper to get a specific control for template usage
  get nameControl() {
    return this.form.get("name")!;
  }

  onSubmit(): void {
    if (this.form.invalid) return; // Validators.required etc. already ran
    this.userService.createUser(this.form.value).subscribe();
  }
}
```

## Displaying Errors in the Template

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="name" placeholder="Name" />
  <div *ngIf="nameControl.invalid && nameControl.touched">
    <span *ngIf="nameControl.errors?.['required']">Name is required</span>
    <span *ngIf="nameControl.errors?.['minlength']">At least 2 characters</span>
  </div>

  <input formControlName="email" placeholder="Email" />
  <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
    <span *ngIf="form.get('email')?.errors?.['email']"
      >Invalid email format</span
    >
  </div>

  <button type="submit" [disabled]="form.invalid">Submit</button>
</form>
```

## Common Mistake

**Spring:** validating in the service instead of at the boundary — the boundary is where data enters, not where it's processed:

```java
// WRONG — validation in the service
@Service
public class UserService {
    public User create(CreateUserRequest req) {
        if (req.getEmail() == null) throw new RuntimeException("Email required");
        // ...
    }
}

// RIGHT — validation on the DTO, triggered at the controller boundary with @Valid
```

**Angular:** not showing validation errors in the template — the form is invalid but the user doesn't know why:

```html
<!-- WRONG — no error messages -->
<input formControlName="email" />

<!-- RIGHT — show errors when control is invalid and has been touched -->
<input formControlName="email" />
<div *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
  Please enter a valid email
</div>
```

## When to Reach For This

- Every user input form in Angular — define validators when building the FormGroup, not on submit
- Every API endpoint that accepts a request body in Spring — annotate the DTO with `@Valid`
- When the same validation rule applies to multiple endpoints — annotation on the DTO reuses it automatically
- When you need to return structured validation errors to the client — `@ControllerAdvice` + `MethodArgumentNotValidException`
- Custom business rules that standard annotations don't cover — create a custom constraint annotation (Spring) or custom validator function (Angular)
