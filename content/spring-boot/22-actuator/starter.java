// ACTUATOR & MONITORING — Starter Exercise
//
// SCENARIO: Add production-grade monitoring to a Spring Boot app.
//
// YOUR TASKS:
// 1. Add spring-boot-starter-actuator to pom.xml (shown as comment)
// 2. Expose health, info, metrics, loggers endpoints in application.yml (shown as comment)
// 3. Implement DatabaseHealthIndicator — checks if a test query succeeds
// 4. Implement AppInfoContributor — adds app name, version, and start time to /actuator/info
// 5. Secure actuator endpoints: /health and /info are public; everything else requires ADMIN role

package com.example.app.actuator;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.util.Map;

// TODO 1: Add to pom.xml:
// <dependency>
//   <groupId>org.springframework.boot</groupId>
//   <artifactId>spring-boot-starter-actuator</artifactId>
// </dependency>

// TODO 2: Add to application.yml:
// management:
//   endpoints:
//     web:
//       exposure:
//         include: health,info,metrics,loggers
//   endpoint:
//     health:
//       show-details: when_authorized

// ─── Task 3: Custom health indicator ─────────────────────────────────────────
// TODO: Implement HealthIndicator
// - Inject JdbcTemplate
// - In health(): run "SELECT 1" query
//   - If it succeeds: return Health.up() with a detail "database: reachable"
//   - If it throws: return Health.down(exception) with detail "database: unreachable"
@Component
public class DatabaseHealthIndicator {  // TODO: implement HealthIndicator

    // TODO: inject JdbcTemplate

    // TODO: implement health() method
}

// ─── Task 4: Custom info contributor ─────────────────────────────────────────
// TODO: Implement InfoContributor
// - In contribute(): call builder.withDetail("app", Map.of(...))
//   with keys: name = "MyApp", version = "1.0.0", startTime = Instant.now().toString()
@Component
public class AppInfoContributor {  // TODO: implement InfoContributor

    // TODO: implement contribute() method
}

// ─── Task 5: Secure actuator endpoints ───────────────────────────────────────
// TODO: Create a SecurityFilterChain bean that:
//   - Permits /actuator/health and /actuator/info without authentication
//   - Requires ADMIN role for all other /actuator/** endpoints
//   - Requires authentication for all other requests
@Configuration
public class ActuatorSecurityConfig {

    // TODO: add @Bean SecurityFilterChain
}
