// SPRING PROFILES — Starter Exercise
//
// TASK: Separate dev and prod configuration using Spring Profiles.
//
// YOUR TASKS:
// 1. Add @Profile("dev") to DevEmailService and @Profile("prod") to ProdEmailService
// 2. Add @Profile to the DataSource beans in DataSourceConfig
// 3. Write application-dev.properties content (in comments)
// 4. Write application-prod.properties content (in comments) — use env vars for secrets
// 5. Add @ActiveProfiles("test") to the test class and explain what it does

package com.example.issuetracker.config;

// ─── Task 1: Profile-separated email services ─────────────────────────────────

// TODO: Add @Profile("dev")
// @Service
class DevEmailService implements EmailService {
    @Override
    public void send(String to, String subject) {
        System.out.println("[DEV] Would email " + to + ": " + subject);
    }
}

// TODO: Add @Profile("prod")
// @Service
class ProdEmailService implements EmailService {
    @Override
    public void send(String to, String subject) {
        // Real SMTP implementation
        System.out.println("Sending real email to: " + to);
    }
}

// ─── Task 2: Profile-separated DataSource beans ───────────────────────────────
// @Configuration
class DataSourceConfig {

    // TODO: Add @Profile("dev") — should return H2 EmbeddedDatabase
    // @Bean
    // public DataSource devDataSource() { ... }

    // TODO: Add @Profile("prod") — should use env vars for connection
    // @Bean
    // public DataSource prodDataSource() { ... }
}

// ─── Task 3: application-dev.properties content ──────────────────────────────
// Write the content here as a block comment.
// Should include:
// - H2 datasource URL
// - Spring to show SQL
// - H2 console enabled
// - Debug logging for com.example package

// ─── Task 4: application-prod.properties content ─────────────────────────────
// Write the content here as a block comment.
// Should include:
// - PostgreSQL datasource from ${DATABASE_URL} env var
// - JPA ddl-auto=validate
// - logging.level.root=WARN
// - Show SQL disabled

// ─── Task 5: Test class with profile ─────────────────────────────────────────
// @SpringBootTest
// TODO: Add @ActiveProfiles("test")
// class UserServiceTest {
//     // What does @ActiveProfiles("test") do here?
//     // TODO: explain in a comment
// }
