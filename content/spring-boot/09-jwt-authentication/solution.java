// JWT AUTHENTICATION — Solution

package com.example.issuetracker.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration:86400000}")
    private long expiration;

    // Task 1: Generate a signed JWT token
    public String generateToken(String username) {
        return Jwts.builder()
            .subject(username)                              // Who this token is for
            .issuedAt(new Date())                           // When it was created
            .expiration(new Date(System.currentTimeMillis() + expiration)) // When it expires
            .signWith(getSigningKey())                       // Sign with HMAC-SHA256
            .compact();                                     // Serialize to String
    }

    // Task 2: Extract username (subject) from token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Task 3: Validate token — correct user AND not expired
    public boolean isTokenValid(String token, UserDetails userDetails) {
        String tokenUsername = extractUsername(token);
        return tokenUsername.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // Task 4: Check if token is past its expiration date
    private boolean isTokenExpired(String token) {
        Date expirationDate = extractClaim(token, Claims::getExpiration);
        return expirationDate.before(new Date());
    }

    // Generic claim extractor — parses and verifies the token, extracts a specific claim
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())  // Verify signature with our secret
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

// ─── Login endpoint that issues a JWT ────────────────────────────────────────
/*
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        // Authenticate — throws BadCredentialsException if wrong
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        // Generate JWT for the authenticated user
        String token = jwtUtil.generateToken(auth.getName());
        return ResponseEntity.ok(Map.of("token", token));
    }
}

// application.properties:
// app.jwt.secret=bXlTZWNyZXRLZXlGb3JKV1RBdXRoZW50aWNhdGlvbjEyMzQ1Njc4OTAxMjM0NTY=
// (base64-encoded key, at least 256 bits for HS256)
// app.jwt.expiration=86400000   (24 hours in milliseconds)
*/
