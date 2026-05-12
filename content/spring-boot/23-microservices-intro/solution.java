// MICROSERVICES WITH SPRING BOOT — Solution

package com.example.orderservice;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

// ─── Task 1: Enable Feign on the application class ───────────────────────────
@SpringBootApplication
@EnableFeignClients  // Scans for @FeignClient interfaces and generates HTTP client implementations
class OrderServiceApplication {
    public static void main(String[] args) {
        org.springframework.boot.SpringApplication.run(OrderServiceApplication.class, args);
    }
}

// ─── Task 2: Feign client for UserService ────────────────────────────────────
// Spring generates the implementation — you just define the interface
// name = "user-service" maps to spring.application.name in user-service
// Eureka resolves the actual host:port at runtime
@FeignClient(name = "user-service")
interface UserServiceClient {

    @GetMapping("/api/users/{id}")
    UserDto getUserById(@PathVariable("id") Long id);
}

// ─── Task 3: Feign client for ProductService ─────────────────────────────────
@FeignClient(name = "product-service")
interface ProductServiceClient {

    @GetMapping("/api/products/{id}")
    ProductDto getProductById(@PathVariable("id") Long id);

    // @RequestParam maps to ?quantity=N query parameter
    @PutMapping("/api/products/{id}/reserve")
    void reserveProduct(@PathVariable("id") Long id, @RequestParam("quantity") int quantity);
}

// ─── Task 4 + 5: OrderService with Feign + Circuit Breaker ───────────────────
@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final UserServiceClient userServiceClient;
    private final ProductServiceClient productServiceClient;

    public OrderService(UserServiceClient userServiceClient,
                        ProductServiceClient productServiceClient) {
        this.userServiceClient = userServiceClient;
        this.productServiceClient = productServiceClient;
    }

    public OrderDto placeOrder(Long userId, Long productId, int quantity) {
        // Task 5: getUserWithFallback wraps the Feign call with circuit breaker protection
        UserDto user = getUserWithFallback(userId);

        // Direct Feign call — no circuit breaker here for simplicity
        ProductDto product = productServiceClient.getProductById(productId);

        if (!user.active()) {
            throw new IllegalStateException("User account is not active: " + userId);
        }

        productServiceClient.reserveProduct(productId, quantity);

        return new OrderDto(userId, productId, quantity, user.name(), product.name());
    }

    // Task 5: Circuit breaker wraps the Feign call
    // When user-service fails repeatedly, circuit opens and fallback runs immediately
    // Circuit closes again after a configured wait period
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserFallback")
    public UserDto getUserWithFallback(Long userId) {
        return userServiceClient.getUserById(userId);
    }

    // Fallback — must have the same parameters as the protected method + Throwable
    // Called when: circuit is open OR the method throws
    private UserDto getUserFallback(Long userId, Throwable t) {
        log.warn("user-service unavailable for userId={}, using fallback. Reason: {}",
            userId, t.getMessage());
        return new UserDto(userId, "Unknown User", true);  // Graceful degradation
    }
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
record UserDto(Long id, String name, boolean active) {}
record ProductDto(Long id, String name, double price) {}
record OrderDto(Long userId, Long productId, int quantity, String userName, String productName) {}

// ─── application.yml additions ────────────────────────────────────────────────
//
// spring:
//   application:
//     name: order-service
//
// eureka:
//   client:
//     service-url:
//       defaultZone: http://localhost:8761/eureka/
//
// resilience4j:
//   circuitbreaker:
//     instances:
//       userService:
//         slidingWindowSize: 10
//         failureRateThreshold: 50      # Open circuit after 50% failures
//         waitDurationInOpenState: 10s  # Try again after 10 seconds
//         permittedNumberOfCallsInHalfOpenState: 3
