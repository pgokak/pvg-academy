// SPRING PROFILES — Solution

package com.example.issuetracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;

// ─── Task 1: Profile-separated email services ─────────────────────────────────
@Service
@Profile("dev")  // Spring creates this bean ONLY when dev profile is active
class DevEmailService implements EmailService {
    @Override
    public void send(String to, String subject) {
        // Logs instead of sending — safe for local development
        System.out.println("[DEV EMAIL] To: " + to + " | Subject: " + subject);
    }
}

@Service
@Profile("prod")  // Only active in production
class ProdEmailService implements EmailService {
    @Override
    public void send(String to, String subject) {
        // Real SMTP implementation would go here
        System.out.println("Sending real email to: " + to);
    }
}

// ─── Task 2: Profile-separated DataSource beans ───────────────────────────────
@Configuration
class DataSourceConfig {

    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        // H2 in-memory database — fast, no setup needed
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .build();
    }

    @Bean
    @Profile("prod")
    public DataSource prodDataSource() {
        // HikariCP connection pool to real PostgreSQL
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(System.getenv("DATABASE_URL"));
        config.setUsername(System.getenv("DATABASE_USER"));
        config.setPassword(System.getenv("DATABASE_PASSWORD"));
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        return new HikariDataSource(config);
    }
}

/*
── Task 3: application-dev.properties ─────────────────────────────────────────
# src/main/resources/application-dev.properties

# H2 in-memory database (resets on every restart)
spring.datasource.url=jdbc:h2:mem:devdb;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver

# Auto-create schema from entities (safe in dev only!)
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 web console — accessible at http://localhost:8080/h2-console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Verbose logging for your own package
logging.level.com.example=DEBUG
logging.level.org.springframework.web=DEBUG

── Task 4: application-prod.properties ────────────────────────────────────────
# src/main/resources/application-prod.properties

# PostgreSQL via environment variables — never hardcode in source control!
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USER}
spring.datasource.password=${DATABASE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# Never auto-modify production schema
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# Minimal logging in production
logging.level.root=WARN
logging.level.com.example=INFO
*/

// ─── Task 5: Test class ───────────────────────────────────────────────────────
// @SpringBootTest
// @ActiveProfiles("test")
// @Transactional  // Rolls back after each test — database stays clean
// class UserServiceTest {
//     // @ActiveProfiles("test") activates application-test.properties
//     // which typically uses:
//     // - H2 in-memory database (fast, isolated from dev DB)
//     // - Mock email service (no real emails sent)
//     // - Test-specific properties
//     //
//     // application-test.properties:
//     // spring.datasource.url=jdbc:h2:mem:testdb
//     // spring.jpa.hibernate.ddl-auto=create-drop
// }
