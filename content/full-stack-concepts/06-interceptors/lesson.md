---
title: "Interceptors & Filters"
version: "Full-Stack"
since: 2003
stable: true
---

## The Problem

```typescript
// Angular — auth token manually added to EVERY HTTP call
getUsers(): Observable<User[]> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return this.http.get<User[]>('/api/users', { headers });
}

getProducts(): Observable<Product[]> {
  const token = localStorage.getItem('token');  // Copy-pasted again
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return this.http.get<Product[]>('/api/products', { headers });
}
// 20 more service methods — all with the same 3 lines duplicated
```

```java
// Spring — logging manually added to EVERY controller
@GetMapping("/users")
public List<User> getUsers() {
    log.info("GET /users called at {}", LocalDateTime.now());  // Duplicated
    return userService.findAll();
}

@PostMapping("/orders")
public Order createOrder(@RequestBody OrderRequest req) {
    log.info("POST /orders called at {}", LocalDateTime.now());  // Duplicated again
    return orderService.create(req);
}
```

Cross-cutting concerns like auth, logging, and error handling end up copy-pasted everywhere.

## Mental Model

An interceptor is a toll booth on the highway. Every request passes through it automatically — you write the logic once and it runs for every request, without touching each individual call.

## Angular HttpInterceptor

Angular interceptors sit between your code and the network. They can read and modify outgoing requests, and read and modify incoming responses.

```typescript
// The interceptor "chain": Your code → Interceptor 1 → Interceptor 2 → Network → Interceptor 2 → Interceptor 1 → Your code
```

## Side-by-Side: Mirror Images

**Angular interceptor — adds token to OUTGOING requests:**

```typescript
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (!token) {
    return next(req); // No token — pass through unchanged
  }

  // Clone the request (requests are immutable) and add the header
  const authReq = req.clone({
    headers: req.headers.set("Authorization", `Bearer ${token}`),
  });

  return next(authReq);
};

// Register in app.config.ts:
// provideHttpClient(withInterceptors([authInterceptor]))
```

**Spring filter — validates token on INCOMING requests:**

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws IOException, ServletException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            if (username != null && jwtUtil.isTokenValid(token)) {
                // Set authentication in Spring Security context
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(username, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // Pass the request to the next filter/controller
        filterChain.doFilter(request, response);
    }
}
```

They're mirror images: Angular adds the token on the way out; Spring validates it on the way in.

## Logging Interceptor (Angular)

```typescript
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const start = Date.now();
  console.log(`→ ${req.method} ${req.url}`);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const duration = Date.now() - start;
        console.log(`← ${event.status} ${req.url} (${duration}ms)`);
      }
    }),
    catchError((err) => {
      console.error(`✗ ${req.method} ${req.url} failed:`, err);
      return throwError(() => err);
    }),
  );
};
```

## Common Mistake

Not registering the interceptor — it silently does nothing:

```typescript
// WRONG — interceptor defined but never registered
export const authInterceptor: HttpInterceptorFn = (req, next) => { ... };

// app.config.ts — MISSING withInterceptors:
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient()  // No interceptors — token never added!
  ]
};

// RIGHT
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, loggingInterceptor])
    )
  ]
};
```

In Spring, the equivalent is forgetting `@Component` on the filter class — Spring Security's filter chain won't include it.

## When to Reach For This

- Adding auth headers to every outgoing request (Angular)
- Validating tokens before any request reaches a controller (Spring)
- Logging all requests and response times in one place
- Global error handling — intercept 401 responses and redirect to login
- Adding request IDs or correlation headers for distributed tracing
- Retrying failed requests automatically (Angular: `retry(2)` in the pipe)
