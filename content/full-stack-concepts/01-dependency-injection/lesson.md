---
title: "Dependency Injection"
version: "Full-Stack"
since: 1994
stable: true
---

## The Problem

```typescript
class UserService {
  private emailService: EmailService;
  private logger: Logger;

  constructor() {
    // This class builds its own dependencies — tightly coupled
    this.emailService = new EmailService("smtp.company.com", 587);
    this.logger = new Logger("file", "/var/log/app.log");
  }

  registerUser(email: string): void {
    // Now try to test this without actually sending emails
    // or writing log files. You can't.
    this.emailService.send(email, "Welcome!");
    this.logger.log(`User registered: ${email}`);
  }
}
```

You can't test `UserService` without spinning up a real SMTP server and real log files. Changing `EmailService` requires rewriting `UserService`. These classes are fused together.

## Mental Model

A restaurant doesn't grow its own vegetables. It orders them. Your class shouldn't create what it needs — it should receive it. The framework is the supplier that hands your class its ingredients, pre-prepared.

## The DI Container

Both Spring and Angular maintain a registry of objects (called beans in Spring, providers in Angular). When a class declares what it needs in its constructor, the framework looks up the registry and injects the right object automatically.

```
Constructor parameter → Framework looks up registry → Injects pre-built object
```

## Side-by-Side: Spring Boot vs Angular

**The same concept: an EmailService injected into a UserService**

**Spring Boot (Java)**

```java
// 1. Register EmailService as a bean
@Service
public class EmailService {
    public void send(String to, String subject) {
        // real implementation
    }
}

// 2. Declare dependency via constructor — Spring injects it
@Service
public class UserService {
    private final EmailService emailService;

    // Spring sees one constructor → injects automatically
    public UserService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void registerUser(String email) {
        emailService.send(email, "Welcome!");
    }
}
```

**Angular (TypeScript)**

```typescript
// 1. Register EmailService in the DI container
@Injectable({ providedIn: "root" })
export class EmailService {
  send(to: string, subject: string): void {
    // real implementation
  }
}

// 2. Declare dependency via constructor — Angular injects it
@Injectable({ providedIn: "root" })
export class UserService {
  constructor(private emailService: EmailService) {}

  registerUser(email: string): void {
    this.emailService.send(email, "Welcome!");
  }
}
```

The pattern is identical. Constructor = "I need this." Framework = "Here you go."

## Testing with DI

Because dependencies come from outside, tests can swap them for fakes:

```typescript
// Angular test
const mockEmailService = { send: jest.fn() };
const userService = new UserService(mockEmailService as EmailService);
userService.registerUser("test@example.com");
expect(mockEmailService.send).toHaveBeenCalledWith(
  "test@example.com",
  "Welcome!",
);
```

No SMTP server. No real email sent. Fast, deterministic test.

## Common Mistake

**Field injection in Spring** — it looks simpler but destroys testability:

```java
// WRONG — field injection
@Service
public class UserService {
    @Autowired  // Spring injects directly into the field
    private EmailService emailService;
    // Now you can't pass a mock in a test without a Spring context
}

// RIGHT — constructor injection
@Service
public class UserService {
    private final EmailService emailService;

    public UserService(EmailService emailService) {
        this.emailService = emailService;
    }
}
```

With field injection, `emailService` is `null` in a plain unit test — you need a full Spring context just to instantiate the class.

## When to Reach For This

- Any time one class uses another class — always inject, never `new`
- When you need to write unit tests that run without infrastructure (DB, email, HTTP)
- When multiple implementations of the same interface exist (e.g., `MockEmailService` in tests, `SmtpEmailService` in production)
- When you want to swap implementations without changing the class that uses them
- When a class is used in multiple contexts (web layer, batch job, test) — each can inject different dependencies
