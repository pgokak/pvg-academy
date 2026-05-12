---
title: "HTTP & REST"
version: "Full-Stack"
since: 2000
stable: true
---

## The Problem

```typescript
// Client — ad-hoc HTTP calls with no structure
fetch("/getUsers"); // Wrong: verb in URL
fetch("/user?action=delete&id=5"); // Wrong: action in query param
fetch("/api/saveUser", { method: "GET", body: JSON.stringify(user) }); // Wrong: GET with body

// Server — inconsistent and confusing
app.get("/getAllUsers", handler);
app.get("/deleteUser/:id", handler); // Wrong HTTP method for deletion
app.post("/users/update", handler); // Wrong HTTP method for update
```

No clear rules. Callers have to read source code to know how to call each endpoint. Errors return HTTP 200 with an error message in the body. Caching breaks because GET is used for mutations.

## Mental Model

REST is a contract. The URL is the noun (what resource), the HTTP method is the verb (what action). `GET /users` fetches all users. `POST /users` creates one. `PUT /users/5` replaces user 5. `DELETE /users/5` removes user 5. Anyone who knows REST knows your API without reading documentation.

## HTTP Methods and Their Meaning

| Method | Meaning                 | Safe? | Idempotent? |
| ------ | ----------------------- | ----- | ----------- |
| GET    | Read — never modify     | Yes   | Yes         |
| POST   | Create a new resource   | No    | No          |
| PUT    | Replace entire resource | No    | Yes         |
| PATCH  | Partial update          | No    | No          |
| DELETE | Remove resource         | No    | Yes         |

**Safe** = no side effects. **Idempotent** = calling it N times = calling it once.

## REST URL Conventions

```
GET    /api/users          → list all users
POST   /api/users          → create a user
GET    /api/users/42       → get user with id 42
PUT    /api/users/42       → replace user 42
PATCH  /api/users/42       → partially update user 42
DELETE /api/users/42       → delete user 42

GET    /api/users/42/orders → orders belonging to user 42
POST   /api/users/42/orders → create an order for user 42
```

Nouns, not verbs. Hierarchy shows relationships.

## Side-by-Side: Spring Boot Server vs Angular Client

**Defining the endpoint (Spring Boot):**

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping              // GET /api/users
    public List<UserResponse> getAll() {
        return userService.findAll();
    }

    @GetMapping("/{id}")     // GET /api/users/42
    public UserResponse getOne(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping             // POST /api/users
    public ResponseEntity<UserResponse> create(
            @Valid @RequestBody CreateUserRequest request) {
        UserResponse created = userService.create(request);
        URI location = URI.create("/api/users/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @DeleteMapping("/{id}")  // DELETE /api/users/42
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

**Calling the endpoint (Angular HttpClient):**

```typescript
@Injectable({ providedIn: "root" })
export class UserService {
  private readonly url = "/api/users";

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  getOne(id: number): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }

  create(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.url, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
```

The Spring method mirrors the Angular call — same URL, same HTTP method, same data shape. This symmetry is the REST contract in action.

## HTTP Status Codes

```
2xx Success:  200 OK, 201 Created, 204 No Content
3xx Redirect: 301 Moved Permanently, 304 Not Modified
4xx Client:   400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict
5xx Server:   500 Internal Server Error, 503 Service Unavailable
```

Use the right code. Return 201 (not 200) when creating. Return 204 (not 200) when deleting. Return 404 when the resource doesn't exist.

## Common Mistake

**Spring:** using GET for mutations — breaks caching and CDNs, which feel safe to cache and replay GET requests:

```java
// WRONG
@GetMapping("/users/{id}/delete")
public String deleteUser(@PathVariable Long id) { ... }

// RIGHT
@DeleteMapping("/users/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) { ... }
```

**Angular:** not handling errors on HttpClient observables — the observable simply completes silently on error if no error handler is provided:

```typescript
// WRONG — no error handling
this.http.get("/api/users").subscribe((users) => (this.users = users));

// RIGHT
this.http.get<User[]>("/api/users").subscribe({
  next: (users) => {
    this.users = users;
  },
  error: (err) => {
    this.errorMsg = "Failed to load users";
  },
});
```

## When to Reach For This

- Any HTTP API you design — REST conventions make it instantly understandable
- When building APIs consumed by multiple clients (web, mobile, third-party) — consistent contracts reduce confusion
- When Angular calls Spring Boot — knowing both sides makes debugging much easier
- When debugging unexpected behavior — check method (GET vs POST) and status code first
- When designing URL structure — think "what is the resource?" not "what is the action?"
