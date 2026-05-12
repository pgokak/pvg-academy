---
title: "Spring Profiles"
version: "Spring Boot 3.x"
since: 2010
stable: true
---

## The Problem

```java
@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource dataSource() {
        // Which one should I use?
        if (System.getenv("ENVIRONMENT").equals("production")) {
            return createPostgresDataSource();
        } else {
            return createH2DataSource();
        }
    }
}
```

Environment checks scattered through the code. Tests use the production datasource by accident. Adding a new environment requires code changes.

## Mental Model

Profiles are costumes. Same actor (application), different outfit (configuration) depending on the stage (environment). Switch costumes by setting one variable — no code changes required.

## Profile-Specific Properties Files

```
src/main/resources/
├── application.properties        ← Base config (all environments share this)
├── application-dev.properties    ← Dev overrides
├── application-staging.properties
└── application-prod.properties   ← Production overrides
```

```properties
# application.properties (shared base)
app.email.from=noreply@company.com
app.email.max-retries=3
spring.jpa.show-sql=false

# application-dev.properties
spring.datasource.url=jdbc:h2:mem:devdb
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.show-sql=true
spring.h2.console.enabled=true
logging.level.com.example=DEBUG

# application-prod.properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USER}
spring.datasource.password=${DATABASE_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
logging.level.root=WARN
```

Activate a profile:

```bash
# Environment variable (for prod servers)
export SPRING_PROFILES_ACTIVE=prod
java -jar app.jar

# Command line (for local testing)
java -jar app.jar --spring.profiles.active=dev

# In application.properties (for default profile)
spring.profiles.default=dev
```

## @Profile on Beans

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @Profile("dev")  // Only created when dev profile is active
    public DataSource devDataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .build();
    }

    @Bean
    @Profile("prod")  // Only created when prod profile is active
    public DataSource prodDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(System.getenv("DATABASE_URL"));
        return new HikariDataSource(config);
    }
}
```

## @Profile on Service Classes

```java
// Dev: logs emails instead of sending
@Service
@Profile("dev")
public class MockEmailService implements EmailService {
    @Override
    public void send(String to, String subject) {
        System.out.println("[DEV] Would send: " + subject + " to " + to);
    }
}

// Prod: actually sends via SMTP
@Service
@Profile("prod")
public class SmtpEmailService implements EmailService {
    @Override
    public void send(String to, String subject) {
        // real SMTP implementation
    }
}
```

## @ActiveProfiles in Tests

```java
@SpringBootTest
@ActiveProfiles("test")  // Activates application-test.properties
class UserServiceIntegrationTest {
    // Tests use H2 in-memory DB, mock email service, verbose logging
}
```

## Common Mistake

Hardcoding environment detection instead of using profiles:

```java
// WRONG — environment checks in code
@Bean
public DataSource dataSource() {
    String env = System.getProperty("env", "dev");
    if ("prod".equals(env)) { ... } else { ... }
    // Multiple environments require code changes
}

// RIGHT — Spring creates the right bean based on the active profile
@Bean @Profile("prod")
public DataSource prodDs() { ... }

@Bean @Profile("!prod")  // All non-prod environments
public DataSource devDs() { ... }
```

## When to Reach For This

- Different databases per environment (H2 for dev, PostgreSQL for prod)
- Mocking external services in development (email, payment, SMS)
- Verbose logging in dev, minimal logging in prod
- Feature flags — activate/deactivate features per environment
- Running integration tests against an in-memory database without touching the real one
