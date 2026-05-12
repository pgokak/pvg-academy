// SPRING SECURITY BASICS — Solution

package com.example.issuetracker.config;

import com.example.issuetracker.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.stereotype.Service;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Enables @PreAuthorize, @PostAuthorize, @Secured on methods
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Public — anyone can browse products and register/login
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()

                // Authenticated — must be logged in to view/create orders
                .requestMatchers(HttpMethod.GET, "/api/orders/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/orders").authenticated()

                // Admin only — role check for admin panel and user deletion
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")

                // Everything else: authentication required
                .anyRequest().authenticated()
            )
            // Stateless: don't create or use HTTP sessions
            // Client must send credentials (JWT) on every request
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // CSRF disabled for stateless REST APIs
            // If using session cookies (browser apps), enable CSRF
            .csrf(csrf -> csrf.disable())
            // Optional: HTTP Basic for testing; replace with JWT filter in production
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt is the standard — it's slow by design (to resist brute force)
        // Work factor 10-12 is a good balance for most applications
        return new BCryptPasswordEncoder(12);
    }
}

// ─── UserDetailsService ───────────────────────────────────────────────────────
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(
                "No user found with email: " + email));

        // Spring Security's built-in UserDetails builder
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(user.getPasswordHash())  // Already BCrypt-hashed in DB
            .roles(user.getRole())             // "USER" → grants "ROLE_USER"
            .accountLocked(!user.isActive())
            .build();
    }
}

// ─── Method-level security example ───────────────────────────────────────────
/*
@Service
public class OrderService {
    // Only the order's owner OR an admin can view it
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
    public Order getOrder(Long orderId, String userId) {
        return orderRepository.findById(orderId).orElseThrow();
    }

    // Only admins can delete orders
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteOrder(Long orderId) {
        orderRepository.deleteById(orderId);
    }
}
*/
