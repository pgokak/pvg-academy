---
title: "Bean Scopes & Lifecycle"
version: "Spring Boot 3.x"
since: 2004
stable: true
---

## The Problem

```java
@Service  // Singleton by default — one instance for the entire application
public class ShoppingCartService {
    private List<CartItem> items = new ArrayList<>(); // Mutable state!

    public void addItem(CartItem item) {
        items.add(item); // Alice adds to cart
        // Bob adds to cart
        // They share the same items list!
        // Alice sees Bob's items. Bob sees Alice's items.
    }
}
```

Singletons are shared across ALL requests. Mutable state in a singleton leaks between users — a serious security and correctness bug.

## Mental Model

Scope is how long an object lives. Singleton lives forever — one per application, shared by everyone. Prototype is reborn on every injection — personal copy. Request lives for one HTTP request. Session lives for one user's browser session. Choose scope based on whether state is shared or personal.

## Bean Scopes

| Scope         | Lives for             | One per                          | Use for                                          |
| ------------- | --------------------- | -------------------------------- | ------------------------------------------------ |
| `singleton`   | Application lifetime  | Application                      | Stateless services, repositories, configs        |
| `prototype`   | Duration of injection | Each injection point             | Stateful helper objects                          |
| `request`     | One HTTP request      | HTTP request                     | Request-scoped data (e.g., current user context) |
| `session`     | One browser session   | User session                     | Shopping cart, preferences, auth state           |
| `application` | Application lifetime  | Same as singleton in Spring Boot | Rarely used                                      |

## @Scope — Changing the Scope

```java
// Prototype — new instance every time it's injected
@Component
@Scope("prototype")
public class PdfGenerator {
    private StringBuilder content = new StringBuilder(); // Mutable but safe — each caller gets own

    public void addPage(String text) { content.append(text); }
    public byte[] generate() { /* render PDF */ }
}

// Request — one instance per HTTP request
@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestContext {
    private String requestId = UUID.randomUUID().toString();
    private String userId;
    // Set once per request, available anywhere that injects RequestContext
}

// Session — one instance per user session
@Component
@Scope(value = WebApplicationContext.SCOPE_SESSION, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class ShoppingCart {
    private List<CartItem> items = new ArrayList<>();

    public void addItem(CartItem item) { items.add(item); }
    public List<CartItem> getItems() { return Collections.unmodifiableList(items); }
    public void clear() { items.clear(); }
}
```

## @PostConstruct and @PreDestroy — Bean Lifecycle

```java
@Service
public class ConnectionPoolService {
    private HikariDataSource pool;

    @PostConstruct  // Called after injection, before the bean is available for use
    public void initialize() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://localhost:5432/mydb");
        this.pool = new HikariDataSource(config);
        System.out.println("Connection pool initialized");
    }

    @PreDestroy  // Called when Spring context shuts down — clean up resources
    public void shutdown() {
        if (pool != null && !pool.isClosed()) {
            pool.close();
            System.out.println("Connection pool closed");
        }
    }
}
```

## ApplicationListener — React to Application Events

```java
@Component
public class ApplicationStartupListener implements ApplicationListener<ApplicationReadyEvent> {
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        System.out.println("Application is ready!");
        // Seed database, warm up caches, start background jobs
    }
}
```

## Common Mistake

Injecting a session-scoped or prototype-scoped bean into a singleton — the singleton captures the first instance only:

```java
// WRONG — ShoppingCart is session-scoped, but the singleton captures one instance
@Service  // Singleton
public class OrderService {
    private final ShoppingCart cart; // Gets one cart at startup — wrong for every user!

    public OrderService(ShoppingCart cart) {
        this.cart = cart; // This is only Alice's cart (or whoever first triggered injection)
    }
}

// RIGHT — use proxyMode so each call goes through the correct session-scoped instance
// @Scope(value = SCOPE_SESSION, proxyMode = ScopedProxyMode.TARGET_CLASS)
// Spring generates a proxy that routes each call to the right session's instance
```

## When to Reach For This

- Stateless services, repositories — singleton (default, correct)
- User-specific mutable state (cart, preferences) — session scope
- Request-scoped tracking (request ID, audit info) — request scope
- Heavyweight, stateful objects that shouldn't be shared — prototype scope
- Resource initialization that needs injected dependencies — `@PostConstruct`
- Resource cleanup (connections, threads, files) — `@PreDestroy`
