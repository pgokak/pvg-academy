---
title: "Microservices with Spring Boot"
version: "Spring Boot 3.x"
since: 2014
stable: true
---

## The Problem

```
// The monolith — one codebase, one deployment unit
OrderController → PaymentService → InventoryService → NotificationService
         \                  ↓
          UserService → EmailService
                   ↓
              ONE DATABASE (500 tables)
```

Changing the payment module requires building and deploying the entire application. A bug in the notification module takes down orders. Ten teams waiting to merge to one branch. The system deploys 2x/month instead of 10x/day because coordination cost is too high.

## Mental Model

Microservices are a city of specialists instead of one person who does everything. Each service is small, independently deployable, and owns its data. The tradeoff: distributed systems problems appear — network failures, partial outages, eventual consistency, and observability across service boundaries.

## Monolith vs Microservices

| Concern           | Monolith                            | Microservices                                   |
| ----------------- | ----------------------------------- | ----------------------------------------------- |
| Deployment        | One unit — all or nothing           | Each service deploys independently              |
| Scaling           | Scale everything together           | Scale only the bottleneck service               |
| Team ownership    | Shared codebase — high coordination | Each team owns a service end-to-end             |
| Failure isolation | One bug can crash everything        | Failures are contained to one service           |
| Complexity        | Simple locally                      | Distributed systems: retries, timeouts, tracing |
| Data              | One shared database                 | Each service owns its own database              |
| When to use       | Early stage, small team             | Multiple teams, independent scaling needed      |

## Each Service: Its Own Spring Boot App

```
user-service/       → http://localhost:8081  → users_db
order-service/      → http://localhost:8082  → orders_db
product-service/    → http://localhost:8083  → products_db
notification-service/ → http://localhost:8084
```

Each service:

- Has its own `pom.xml` and `Application.java`
- Connects to its own database schema
- Exposes a REST API for other services to call
- Has its own `application.yml` with `spring.application.name`

```yaml
# order-service/src/main/resources/application.yml
spring:
  application:
    name: order-service # Service identity — used by service discovery
  datasource:
    url: jdbc:postgresql://localhost:5432/orders_db
```

## Inter-Service Communication: OpenFeign (Declarative HTTP)

OpenFeign is the cleanest way to call other services — you define an interface and Spring generates the HTTP client:

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

```java
// 1. Enable Feign on the main class
@SpringBootApplication
@EnableFeignClients
public class OrderServiceApplication { ... }

// 2. Declare the client — Spring generates the implementation
@FeignClient(name = "user-service", url = "http://localhost:8081")
public interface UserServiceClient {

    @GetMapping("/api/users/{id}")
    UserDto getUserById(@PathVariable Long id);

    @PostMapping("/api/users/{id}/notify")
    void notifyUser(@PathVariable Long id, @RequestBody NotificationRequest request);
}

// 3. Inject and use like any other bean
@Service
public class OrderService {

    private final UserServiceClient userServiceClient;
    private final OrderRepository orderRepository;

    public Order placeOrder(OrderRequest request) {
        // Feign calls user-service HTTP endpoint transparently
        UserDto user = userServiceClient.getUserById(request.getUserId());
        if (!user.isActive()) {
            throw new IllegalStateException("User account is not active");
        }
        Order order = orderRepository.save(new Order(request));
        userServiceClient.notifyUser(user.getId(), new NotificationRequest("Order placed", order.getId()));
        return order;
    }
}
```

## Service Discovery: Eureka

Without service discovery, URLs are hardcoded — brittle in cloud environments where IPs change.

```xml
<!-- Eureka Server dependency -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

```java
// The registry server — one standalone Spring Boot app
@SpringBootApplication
@EnableEurekaServer
public class ServiceRegistryApplication { ... }
```

```yaml
# Each microservice registers with Eureka
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

```java
// With Eureka: use service name instead of hardcoded URL
@FeignClient(name = "user-service")  // Eureka resolves to actual host:port
public interface UserServiceClient { ... }
```

## API Gateway: Spring Cloud Gateway

A single entry point that routes requests to the right service:

```java
@SpringBootApplication
public class GatewayApplication { ... }
```

```yaml
# application.yml — gateway routing config
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service # lb:// = load-balanced via Eureka
          predicates:
            - Path=/api/users/**
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
```

## Circuit Breaker: Resilience4j

Fail fast when a downstream service is down — instead of queuing 1000 threads waiting for a timeout:

```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot3</artifactId>
</dependency>
```

```java
@Service
public class OrderService {

    @CircuitBreaker(name = "userService", fallbackMethod = "getUserFallback")
    public UserDto getUser(Long userId) {
        return userServiceClient.getUserById(userId);
    }

    // Fallback — called when circuit is open or calls are failing
    private UserDto getUserFallback(Long userId, Throwable t) {
        log.warn("user-service unavailable, using fallback for userId={}", userId);
        return new UserDto(userId, "Unknown User", false);
    }
}
```

## Observability: Distributed Tracing

A single request spans multiple services — tracing ties them together with a trace ID:

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
</dependency>
```

```yaml
management:
  tracing:
    sampling:
      probability: 1.0 # Sample 100% of requests (use 0.1 in high-traffic prod)
  zipkin:
    tracing:
      endpoint: http://zipkin:9411/api/v2/spans
```

Every log line, every HTTP call, and every DB query from a single user request shares the same `traceId` — visible in Zipkin's UI.

## Common Mistake

Sharing a database between microservices — tight coupling at the data layer defeats the purpose:

```
// WRONG — order-service directly queries user-service's database
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // This query joins orders table (order-service DB) with users table (user-service DB)
    @Query("SELECT o FROM Order o JOIN User u ON o.userId = u.id WHERE u.email = :email")
    List<Order> findOrdersByUserEmail(String email);
}
// Now order-service can't deploy without user-service's schema
// User-service can't change its schema without breaking order-service

// RIGHT — order-service calls user-service's REST API to get user data
// Each service owns its data; schema changes are internal
UserDto user = userServiceClient.getUserByEmail(email);
List<Order> orders = orderRepository.findByUserId(user.getId());
```

## When to Reach For This

- Multiple teams with independent release schedules
- Services with very different scaling characteristics (auth vs. video encoding)
- When a single module's failure must not take down the whole application
- When different parts of the system need different tech stacks (Java service + Python ML service)
- After you've felt the pain of the monolith first — don't start with microservices on day one
