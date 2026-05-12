// JWT AUTHENTICATION — Starter Exercise
//
// TASK: Complete the JwtUtil class.
//
// YOUR TASKS:
// 1. Implement generateToken(String username) → String
//    - Use Jwts.builder()
//    - Set subject to username
//    - Set issued-at to now
//    - Set expiration to now + this.expiration milliseconds
//    - Sign with getSigningKey()
//
// 2. Implement extractUsername(String token) → String
//    - Extract the subject claim from the token
//
// 3. Implement isTokenValid(String token, UserDetails userDetails) → boolean
//    - Username in token matches userDetails.getUsername()
//    - Token is not expired
//
// 4. Implement isTokenExpired(String token) → boolean (private)
//    - Extract the expiration claim and compare to now
//
// Note: Uses the io.jsonwebtoken (jjwt) library, version 0.12.x

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

    @Value("${app.jwt.expiration:86400000}")  // Default: 24 hours
    private long expiration;

    // TODO: Task 1 — generate a signed JWT token
    public String generateToken(String username) {
        // TODO: use Jwts.builder() with subject, issuedAt, expiration, and signWith
        return null;
    }

    // TODO: Task 2 — extract the username (subject) from a token
    public String extractUsername(String token) {
        // TODO: use extractClaim(token, Claims::getSubject)
        return null;
    }

    // TODO: Task 3 — check if token is valid for this user
    public boolean isTokenValid(String token, UserDetails userDetails) {
        // TODO: compare username and check not expired
        return false;
    }

    // TODO: Task 4 — check if token is expired
    private boolean isTokenExpired(String token) {
        // TODO: extract expiration claim and compare with new Date()
        return true;
    }

    // PROVIDED: Generic claim extractor — use this in your implementations
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return claimsResolver.apply(claims);
    }

    // PROVIDED: Creates the signing key from the base64-encoded secret
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
