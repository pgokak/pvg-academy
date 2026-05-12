---
title: "Configuration & Properties"
version: "Spring Boot 3.x"
since: 2014
stable: true
---

## The Problem

```java
// Hardcoded values scattered in source code
@Service
public class EmailService {
    private final String smtpHost = "smtp.gmail.com"; // Hardcoded!
    private final int smtpPort = 587;                  // Hardcoded!
    private final String apiKey = "AIzaSy...secret";   // IN SOURCE CONTROL!
}

@Service
public class PaymentService {
    private final String stripeKey = "sk_live_abc123"; // Committed to git!
    private final int maxRetries = 3;                  // Must recompile to change
}
```

Changing a value requires a code change, recompile, and redeploy. Secrets end up in source control. Dev and prod have different values but same code.

## Mental Model

`application.properties` is the control panel for your application. Your code reads dials, not hardcoded values. Operators can change the control panel without touching code — environment-specific without environment-specific source files.

## application.properties vs application.yml

```properties
# application.properties (key=value)
app.email.smtp-host=smtp.gmail.com
app.email.smtp-port=587
app.email.from=noreply@company.com
app.payment.stripe-key=${STRIPE_KEY}
app.payment.max-retries=3
```

```yaml
# application.yml (hierarchical — same data, YAML format)
app:
  email:
    smtp-host: smtp.gmail.com
    smtp-port: 587
    from: noreply@company.com
  payment:
    stripe-key: ${STRIPE_KEY}
    max-retries: 3
```

Both are equivalent. YAML is cleaner for nested properties; properties is simpler for flat configs.

## @Value — Simple Injection

```java
@Service
public class EmailService {
    @Value("${app.email.smtp-host}")
    private String smtpHost;

    @Value("${app.email.smtp-port:587}")  // 587 is the default if not in properties
    private int smtpPort;

    @Value("${app.email.from}")
    private String fromAddress;
}
```

Good for one or two properties. Becomes messy with many related properties.

## @ConfigurationProperties — Type-Safe Config (Preferred)

```java
// Maps all app.email.* properties to this class
@ConfigurationProperties(prefix = "app.email")
public class EmailProperties {
    private String smtpHost;    // maps app.email.smtp-host
    private int smtpPort = 587; // default value
    private String from;
    private int maxRetries = 3;
    // getters + setters (or use Lombok @Data)
}

// Enable it in a @Configuration class or directly on the record:
@Configuration
@EnableConfigurationProperties(EmailProperties.class)
public class AppConfig {}

// Or register all @ConfigurationProperties beans:
// @SpringBootApplication + @ConfigurationPropertiesScan
```

```java
// Inject the whole config object
@Service
public class EmailService {
    private final EmailProperties config;

    public EmailService(EmailProperties config) {
        this.config = config;
    }

    public void send(String to, String subject) {
        connectTo(config.getSmtpHost(), config.getSmtpPort());
    }
}
```

## Environment Variables Override Properties

Spring Boot's property source hierarchy (highest priority first):

1. Command-line arguments (`--server.port=9090`)
2. OS environment variables (`SERVER_PORT=9090`)
3. `application-{profile}.properties`
4. `application.properties`
5. Default values in code

```bash
# Override without changing properties file
export DATABASE_URL=jdbc:postgresql://prod-db:5432/mydb
export JWT_SECRET=productionSecretKey
java -jar app.jar
```

## Common Mistake

Hardcoding secrets in properties files that get committed to source control:

```properties
# WRONG — committed to git, secret exposed
app.jwt.secret=myActualProductionSecret
app.stripe.key=sk_live_realkey123

# RIGHT — reference environment variables; default for local dev only
app.jwt.secret=${JWT_SECRET:localDevSecretNotForProd}
app.stripe.key=${STRIPE_KEY}
# Set STRIPE_KEY in production environment, CI/CD secrets, or secret manager
```

## When to Reach For This

- Any value that differs between environments (dev/staging/prod) — externalize it
- Any secret (API keys, passwords, tokens) — always use environment variables, never commit
- Groups of related config (all email settings) — use `@ConfigurationProperties` for type safety
- Simple one-off values — `@Value` is fine
- When you need config validation at startup — add `@Validated` + constraints on `@ConfigurationProperties`
