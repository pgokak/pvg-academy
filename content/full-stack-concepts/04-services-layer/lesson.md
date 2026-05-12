---
title: "The Services Layer"
version: "Full-Stack"
since: 2003
stable: true
---

## The Problem

```java
// Spring controller doing EVERYTHING — a monolith in miniature
@RestController
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JavaMailSender mailSender;

    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        // Validation logic
        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            throw new RuntimeException("Invalid email");
        }
        // Password hashing — business logic!
        user.setPassword(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt()));
        // Database access
        User saved = userRepository.save(user);
        // Email sending
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(saved.getEmail());
        msg.setSubject("Welcome!");
        mailSender.send(msg);
        return saved;
    }
}
```

This controller does HTTP handling, validation, password hashing, database access, AND email sending. You can't reuse the registration logic in a batch import. You can't test it without a database AND a mail server. It's impossible to maintain.

## Mental Model

A service is a specialist. The controller is a manager — it delegates to specialists instead of doing everything itself. The manager knows who to call; the specialists know how to do the work.

## The Three Layers

```
HTTP Layer (Controller / Component)
    ↓ delegates to
Service Layer (Business Logic)
    ↓ delegates to
Data Layer (Repository / HTTP Client)
```

**Controller/Component responsibilities:**

- Parse HTTP request / handle UI event
- Call the right service method
- Return HTTP response / update UI state
- Handle HTTP-level errors (404, 400)

**Service responsibilities:**

- Business logic and rules
- Orchestrate multiple repositories or other services
- Transform data
- Send emails, trigger events

**Repository/HTTP Client responsibilities:**

- Data access only — no business logic
- Query the database or external API
- Return raw data to the service

## Side-by-Side: Spring Boot vs Angular

**Spring Boot — controller delegates to service:**

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        // Controller only handles HTTP concerns
        UserResponse created = userService.createUser(request);
        return ResponseEntity.status(201).body(created);
    }
}

@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;

    public UserResponse createUser(CreateUserRequest request) {
        // All business logic lives here
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(request.getEmail(), hashedPassword);
        User saved = userRepository.save(user);
        emailService.sendWelcome(saved.getEmail());
        return UserResponse.from(saved);
    }
}
```

**Angular — component delegates to service:**

```typescript
@Component({
  selector: "app-user-form",
  template: `<button (click)="submit()">Create User</button>`,
})
export class UserFormComponent {
  constructor(private userService: UserService) {}

  submit(): void {
    // Component only handles UI concerns
    this.userService.createUser(this.form.value).subscribe({
      next: (user) => this.router.navigate(["/users", user.id]),
      error: (err) => (this.errorMessage = err.message),
    });
  }
}

@Injectable({ providedIn: "root" })
export class UserService {
  constructor(private http: HttpClient) {}

  createUser(data: CreateUserRequest): Observable<User> {
    // All HTTP + business logic in the service
    return this.http
      .post<User>("/api/users", data)
      .pipe(catchError(this.handleError));
  }
}
```

## Common Mistake

Putting business logic in the controller or component — it seems convenient but makes the logic impossible to reuse or test:

```typescript
// WRONG — HTTP calls and data transformation in the component
@Component({ template: `...` })
export class ProductListComponent {
  products: Product[] = [];

  ngOnInit(): void {
    // Direct HTTP call — can't reuse this in another component
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        // Business logic mixed with UI logic
        this.products = data
          .filter((p: Product) => p.stock > 0)
          .sort((a: Product, b: Product) => a.price - b.price);
      });
  }
}

// RIGHT — component delegates, service owns the logic
@Injectable({ providedIn: "root" })
export class ProductService {
  getAvailableProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>("/api/products")
      .pipe(
        map((products) =>
          products.filter((p) => p.stock > 0).sort((a, b) => a.price - b.price),
        ),
      );
  }
}
```

## When to Reach For This

- Any time a component or controller is doing more than one thing — extract the "what" to a service
- When the same logic appears in more than one component — a service makes it one place
- When you need to test business logic without rendering UI or making real HTTP calls
- When business rules change often — centralized in a service means one change, not many
- When orchestrating multiple API calls or repositories — the service is the coordinator
