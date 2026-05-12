// SPRING SECURITY BASICS — Starter Exercise
//
// TASK: Configure Spring Security for a REST API.
//
// Requirements:
// - Public (no auth): GET /api/products/**, POST /api/auth/login, POST /api/auth/register
// - Authenticated users: GET /api/orders/**, POST /api/orders
// - ADMIN role only: /api/admin/**, DELETE /api/users/**
// - Stateless API (no sessions, JWT will be added later)
// - Password encoding with BCrypt
//
// YOUR TASKS:
// 1. Complete the SecurityFilterChain bean with the above rules
// 2. Add a BCryptPasswordEncoder bean
// 3. Complete CustomUserDetailsService to load users from UserRepository
// 4. Enable method security with @EnableMethodSecurity

package com.example.issuetracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
// TODO: Add @EnableWebSecurity
// TODO: Add @EnableMethodSecurity for @PreAuthorize support
public class SecurityConfig {

    // TODO: Complete this SecurityFilterChain bean
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // TODO: Configure the 4 access rules listed above
                // Public endpoints...
                // Authenticated endpoints...
                // Admin-only endpoints...
                // Default: require authentication
                .anyRequest().authenticated()
            )
            // TODO: Configure stateless session management
            // TODO: Disable CSRF (stateless REST API)
            ;
        return http.build();
    }

    // TODO: Add PasswordEncoder @Bean using BCrypt

    // TODO: Implement CustomUserDetailsService that:
    //   - Implements UserDetailsService
    //   - Injects UserRepository
    //   - Loads user by email (use email as the username)
    //   - Returns UserDetails with email, passwordHash, and role
    //   - Throws UsernameNotFoundException if not found
}
