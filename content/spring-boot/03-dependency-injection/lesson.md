---
title: "Dependency Injection in Spring"
version: "Spring Boot 3.x"
since: 2004
stable: true
---

## The Problem

```java
@Service
public class OrderService {
    // Tight coupling — creates its own dependencies
    private UserRepository userRepository = new UserRepository(); // Which DB? Which config?
    private EmailService emailService = new EmailService("smtp.company.com");
    private PaymentGateway paymentGateway = new StripeGateway("hardcoded_key");

    public Order createOrder(Long userId, OrderRequest req) {
        // Cannot test without a real DB, real SMTP, real Stripe
        User user = userRepository.findById(userId);
        Order order = paymentGateway.charge(user, req);
        emailService.sendConfirmation(user.getEmail(), order);
        return order;
    }
}
```

You can't test this class without real infrastructure. You can't swap `StripeGateway` for `PayPalGateway`. The class controls its own dependencies instead of receiving them.

## Mental Model

Spring is a container of pre-built objects. When you ask for one via a constructor, Spring reaches into the container and hands it to you — already configured and ready to use. You don't build the ingredients; you request them.

## Stereotype Annotations — Registering Beans

```java
@Component    // Generic — register this class as a Spring bean
@Service      // Business logic layer (semantic alias for @Component)
@Repository   // Data access layer — also translates DB exceptions to Spring exceptions
@Controller   // Web layer — handles HTTP requests
@RestController  // Web layer + @ResponseBody (returns JSON)
```

All four register the class as a Spring bean. The difference is semantic — it communicates the role to developers and enables framework features (`@Repository` enables exception translation).

## Constructor Injection (Preferred)

```java
@Service
public class OrderService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PaymentGateway paymentGateway;

    // Spring detects one constructor → injects all parameters automatically
    // No @Autowired needed (Spring Boot 4.3+)
    public OrderService(
            UserRepository userRepository,
            EmailService emailService,
            PaymentGateway paymentGateway) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.paymentGateway = paymentGateway;
    }
}
```

Benefits: fields can be `final`, testable without Spring, compile-time safety.

## @Qualifier — Choosing Between Multiple Implementations

```java
// Two beans implement PaymentGateway
@Service("stripeGateway")
public class StripeGateway implements PaymentGateway { ... }

@Service("paypalGateway")
public class PayPalGateway implements PaymentGateway { ... }

// Inject the specific one you want
@Service
public class OrderService {
    public OrderService(@Qualifier("stripeGateway") PaymentGateway gateway) {
        this.paymentGateway = gateway;
    }
}
```

## @Primary — Set the Default

```java
@Service
@Primary  // Use this implementation when no @Qualifier is specified
public class StripeGateway implements PaymentGateway { ... }

@Service
public class PayPalGateway implements PaymentGateway { ... }

// No @Qualifier needed — Spring picks StripeGateway automatically
@Service
public class OrderService {
    public OrderService(PaymentGateway gateway) { ... }  // Gets StripeGateway
}
```

## Common Mistake

Field injection with `@Autowired` — looks simple but prevents unit testing without a Spring context:

```java
// WRONG — field injection
@Service
public class OrderService {
    @Autowired
    private UserRepository userRepository;  // Can't pass a mock in tests
    @Autowired
    private EmailService emailService;
}

// In a unit test: OrderService service = new OrderService();
// userRepository is null — must spin up a full Spring context just to test

// RIGHT — constructor injection
@Service
public class OrderService {
    private final UserRepository userRepository;
    private final EmailService emailService;

    public OrderService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
}
// In a unit test:
// OrderService service = new OrderService(mockRepo, mockEmail); // No Spring needed
```

## When to Reach For This

- Every Spring-managed class that depends on another — always use constructor injection
- When you need to swap implementations (test vs production, Stripe vs PayPal) — inject the interface, not the class
- When two beans implement the same interface — use `@Qualifier` to be explicit, `@Primary` for a sensible default
- When writing unit tests — constructor injection means no Spring context, just `new MyService(mock1, mock2)`
- When debugging "expected single matching bean but found 2" — add `@Primary` or `@Qualifier`
