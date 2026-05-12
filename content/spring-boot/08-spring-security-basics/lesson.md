---
title: "Spring Security Basics"
version: "Spring Boot 3.x"
since: 2004
stable: true
---

## The Problem

```java
// No security — every endpoint is public
@RestController
public class UserController {
    @DeleteMapping("/users/{id}")
    public void delete(@PathVariable Long id) {
        userService.delete(id); // Anyone can call this!
    }

    @GetMapping("/admin/reports")
    public List<Report> getReports() {
        return reportService.getAll(); // No admin check!
    }
}
```

Without security, every endpoint is reachable by anyone. No authentication, no authorization, no CSRF protection.

## Mental Model

Spring Security is a series of filters that every request passes through before reaching your controller. The request moves through a chain: authentication check, authorization check, CSRF check. Most security concerns are handled before your code even runs.

## SecurityFilterChain Bean

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — no auth needed
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                // Role-based
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                // Stateless = no session cookies; client sends token on every request
            )
            .csrf(csrf -> csrf.disable()) // Disable for stateless REST APIs
            .httpBasic(Customizer.withDefaults()); // Or use JWT filter
        return http.build();
    }

    // Password encoder — never store plaintext passwords
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

## UserDetailsService — Load User for Authentication

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(user.getPasswordHash()) // BCrypt hash from DB
            .roles(user.getRole())            // "USER" → "ROLE_USER"
            .build();
    }
}
```

## Securing Method-Level Access

```java
@Service
@PreAuthorize("hasRole('ADMIN')")  // Requires ADMIN role for all methods
public class AdminReportService {

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public UserReport getUserReport(Long userId) {
        // Admin can see any report; user can only see their own
        return reportRepository.findByUserId(userId);
    }
}
```

## Common Mistake

Forgetting to configure CSRF properly — stateless REST APIs should disable CSRF (since browsers don't auto-send auth tokens), but session-based apps need it:

```java
// WRONG for REST APIs — CSRF enabled by default → all POST/PUT/DELETE fail with 403
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(auth -> auth.anyRequest().authenticated());
    // CSRF is enabled by default — Angular's HttpClient doesn't send CSRF tokens
    // Result: all mutating requests return 403 Forbidden
    return http.build();
}

// RIGHT for stateless REST APIs
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())          // Disable for JWT-based APIs
        .sessionManagement(s -> s
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated());
    return http.build();
}
```

## When to Reach For This

- Any production application — add spring-boot-starter-security from day one
- When some endpoints are public and others require auth — `permitAll()` vs `authenticated()`
- When roles control access — `hasRole("ADMIN")` in security config or `@PreAuthorize`
- When accepting passwords — always use `BCryptPasswordEncoder`, never store plaintext
- When building a stateless JWT API — set `SessionCreationPolicy.STATELESS` and disable CSRF
