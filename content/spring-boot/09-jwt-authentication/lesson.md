---
title: "JWT Authentication"
version: "Spring Boot 3.x"
since: 2014
stable: true
---

## The Problem

```java
// Session-based auth — stores state on the server
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpSession session) {
    User user = authenticate(req.email(), req.password());
    session.setAttribute("userId", user.getId()); // State on server!
    return ResponseEntity.ok("Logged in");
}
// PROBLEMS:
// - Scale horizontally (2+ servers)? Sessions aren't shared.
// - Add a mobile app? Sessions rely on cookies.
// - Microservices calling each other? Session doesn't travel.
```

Session auth works for single-server apps but breaks in distributed, stateless, or multi-client architectures.

## Mental Model

A JWT is a stamped passport. The server stamps it once on login — it contains your identity and permissions. You carry it everywhere. The server just verifies the stamp (cryptographic signature) — no memory or lookup needed.

## JWT Structure

```
header.payload.signature
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGljZUBleGFtcGxlLmNvbSIsInJvbGVzIjpbIlVTRVIiXSwiZXhwIjoxNjk5OTk5OTk5fQ.abc123
```

- **Header**: algorithm (HS256) and token type
- **Payload (Claims)**: subject (email), roles, expiration, issued-at
- **Signature**: `HMAC-SHA256(base64(header) + "." + base64(payload), secretKey)`

The payload is Base64-encoded but NOT encrypted — don't put passwords in it. The signature proves the server created it and it hasn't been tampered with.

## JWT Utility Class

```java
@Component
public class JwtUtil {
    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration:86400000}")  // 24 hours default
    private long expiration;

    public String generateToken(String username) {
        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey())
            .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return claimsResolver.apply(claims);
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

## JWT Filter — Validates Token on Every Request

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response); // No token — continue (security rules will reject if needed)
            return;
        }

        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        // Set authentication if token is valid and no auth is already set
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtUtil.isTokenValid(token, userDetails)) {
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        chain.doFilter(request, response);
    }
}
```

## Common Mistake

Storing sensitive data in the JWT payload — it's Base64, not encrypted:

```java
// WRONG — anyone can decode this (just base64, not encrypted)
return Jwts.builder()
    .claim("password", user.getPassword())   // NEVER put passwords in JWT
    .claim("creditCard", "4111111111111111") // NEVER put sensitive data
    .compact();

// RIGHT — only put non-sensitive identity claims
return Jwts.builder()
    .subject(user.getEmail())           // Email is fine as identity
    .claim("roles", user.getRoles())    // Roles/permissions are fine
    .expiration(new Date(...))
    .compact();
```

## When to Reach For This

- Stateless REST APIs (the primary use case for JWT)
- Mobile apps — can't use cookies easily; JWT in Authorization header works universally
- Microservices — each service validates the JWT independently, no shared session store
- Single sign-on (SSO) — one token works across multiple services
- When refresh tokens are needed — short-lived access token + long-lived refresh token
