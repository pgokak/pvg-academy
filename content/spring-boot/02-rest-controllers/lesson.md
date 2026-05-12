---
title: "REST Controllers"
version: "Spring Boot 3.x"
since: 2014
stable: true
---

## The Problem

```java
// Old Servlet-based approach — verbose and error-prone
@WebServlet("/users")
public class UserServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        resp.setContentType("application/json");
        // Manual JSON serialization
        PrintWriter out = resp.getWriter();
        List<User> users = userDao.findAll(); // DAO wired manually
        ObjectMapper mapper = new ObjectMapper();
        out.print(mapper.writeValueAsString(users));
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        // Manual JSON deserialization
        ObjectMapper mapper = new ObjectMapper();
        User user = mapper.readValue(req.getInputStream(), User.class);
        // No validation, no error handling, manual response building
        userDao.save(user);
        resp.setStatus(201);
    }
}
```

No type safety, manual JSON marshaling, no URL pattern matching, no path variable extraction, no validation. Spring MVC's `@RestController` eliminates all of this.

## Mental Model

A REST controller is a receptionist. It takes HTTP requests, validates them at the door, delegates the real work to a service, and hands back a response. It doesn't know or care how the work is done — it only handles the handoff.

## @RestController vs @Controller

```java
@Controller   // Returns view names (HTML templates)
@RestController  // Returns data (JSON/XML) — @Controller + @ResponseBody

// @RestController is equivalent to:
@Controller
@ResponseBody  // Applied to every method — write return value to HTTP body
public class UserController { }
```

## Mapping Annotations

```java
@RestController
@RequestMapping("/api/users")   // Base path for all methods in this controller
public class UserController {

    @GetMapping              // GET /api/users
    @PostMapping             // POST /api/users
    @PutMapping("/{id}")     // PUT /api/users/42
    @PatchMapping("/{id}")   // PATCH /api/users/42
    @DeleteMapping("/{id}")  // DELETE /api/users/42
}
```

## Parameter Annotations

```java
// Path variable: /api/users/42 → id = 42
@GetMapping("/{id}")
public User getUser(@PathVariable Long id) { ... }

// Query param: /api/users?page=2&size=20 → page = 2, size = 20
@GetMapping
public Page<User> getUsers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) { ... }

// Request body: JSON body → Java object
@PostMapping
public User createUser(@Valid @RequestBody CreateUserRequest request) { ... }

// Request header
@GetMapping("/me")
public User getMe(@RequestHeader("Authorization") String authHeader) { ... }
```

## ResponseEntity — Full Control

```java
// Return just the body (Spring sets 200 OK automatically)
@GetMapping("/{id}")
public User getUser(@PathVariable Long id) {
    return userService.findById(id);
}

// Use ResponseEntity for custom status codes, headers, or conditional responses
@PostMapping
public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest req) {
    UserResponse created = userService.create(req);
    URI location = URI.create("/api/users/" + created.getId());
    return ResponseEntity
        .created(location)           // 201 Created
        .header("X-User-Id", created.getId().toString())
        .body(created);
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.delete(id);
    return ResponseEntity.noContent().build();  // 204 No Content
}
```

## Common Mistake

Using `@Controller` instead of `@RestController` for a JSON API — the return value is treated as a view name and Spring looks for an HTML template:

```java
// WRONG — returns "users" as view name, not JSON
@Controller
@RequestMapping("/api/users")
public class UserController {
    @GetMapping
    public List<User> getAll() {
        return userService.findAll(); // Spring MVC tries to render a "users" template
    }
}

// RIGHT
@RestController  // Every method's return value is serialized to JSON
@RequestMapping("/api/users")
public class UserController {
    @GetMapping
    public List<User> getAll() {
        return userService.findAll(); // Returns JSON array
    }
}
```

## When to Reach For This

- Every HTTP endpoint in a REST API — `@RestController` is the entry point
- When you need custom HTTP status codes (201, 204, 409) — use `ResponseEntity<T>`
- When extracting path segments (`/users/{id}`) — use `@PathVariable`
- When accepting optional filters or pagination (`/users?page=0&size=10`) — use `@RequestParam`
- When accepting complex objects from the client — use `@RequestBody` with validation via `@Valid`
