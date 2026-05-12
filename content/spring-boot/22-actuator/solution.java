// ACTUATOR & MONITORING — Solution

package com.example.app.actuator;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

// ─── Task 3: Database health indicator ───────────────────────────────────────
// Spring Boot automatically includes this in /actuator/health under "database" key
// The name is derived from the class name: DatabaseHealthIndicator -> "database"
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseHealthIndicator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Health health() {
        try {
            // Run the lightest possible query to verify DB connectivity
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            return Health.up()
                .withDetail("database", "reachable")
                .withDetail("query", "SELECT 1")
                .build();

        } catch (Exception e) {
            // Down with the exception — Spring includes the message in the response
            return Health.down(e)
                .withDetail("database", "unreachable")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}

// ─── Task 4: Info contributor ─────────────────────────────────────────────────
// Contributes to /actuator/info alongside info.* properties from application.yml
@Component
public class AppInfoContributor implements InfoContributor {

    private final Instant startTime = Instant.now();  // Captured at bean creation

    @Override
    public void contribute(Info.Builder builder) {
        builder.withDetail("app", Map.of(
            "name", "MyApp",
            "version", "1.0.0",
            "startTime", startTime.toString()
        ));
    }
}

// ─── Task 5: Actuator security ────────────────────────────────────────────────
// Health and info: public (used by load balancers, Kubernetes probes, status pages)
// Everything else: ADMIN role required (env exposes secrets, beans exposes internals)
@Configuration
public class ActuatorSecurityConfig {

    @Bean
    public SecurityFilterChain actuatorSecurityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
            // Public endpoints — no authentication required
            .requestMatchers("/actuator/health", "/actuator/info").permitAll()
            // All other actuator endpoints — ADMIN role required
            .requestMatchers("/actuator/**").hasRole("ADMIN")
            // All other application endpoints — authenticated
            .anyRequest().authenticated()
        );
        return http.build();
    }
}

// ─── application.yml ──────────────────────────────────────────────────────────
// Task 2:
//
// management:
//   endpoints:
//     web:
//       exposure:
//         include: health,info,metrics,loggers
//   endpoint:
//     health:
//       show-details: when_authorized   # Full details for authenticated users only
//
// info:
//   app:
//     name: MyApp
//     version: "@project.version@"     # Resolved from Maven pom.xml at build time
