// MICROSERVICES WITH SPRING BOOT — Starter Exercise
//
// SCENARIO: An OrderService that needs to call UserService and ProductService
// using Feign clients. Currently it uses raw RestTemplate with hardcoded URLs.
//
// YOUR TASKS:
// 1. Add @EnableFeignClients to the main application class (shown as comment)
// 2. Replace the UserServiceClient stub with a proper @FeignClient interface
//    that calls GET /api/users/{id} on "user-service"
// 3. Replace the ProductServiceClient stub with a proper @FeignClient interface
//    that calls GET /api/products/{id} and PUT /api/products/{id}/reserve
// 4. Update OrderService to use the Feign clients instead of RestTemplate
// 5. Add a @CircuitBreaker on the getUserById call with a fallback that
//    returns a default UserDto when user-service is down

package com.example.orderservice;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

// TODO 1: Add @EnableFeignClients to OrderServiceApplication.java:
// @SpringBootApplication
// @EnableFeignClients
// public class OrderServiceApplication { ... }

// ─── Task 2: Replace with @FeignClient ───────────────────────────────────────
// TODO: Convert this to a @FeignClient interface
// @FeignClient(name = "user-service") — Feign resolves via Eureka OR use url = "http://..."
// Method: UserDto getUserById(@PathVariable Long id) → GET /api/users/{id}
public interface UserServiceClient {
    // This is a placeholder — replace with proper @FeignClient + @GetMapping
    UserDto getUserById(Long id);
}

// ─── Task 3: Replace with @FeignClient ───────────────────────────────────────
// TODO: Convert this to a @FeignClient interface
// @FeignClient(name = "product-service")
// Methods:
//   ProductDto getProductById(@PathVariable Long id) → GET /api/products/{id}
//   void reserveProduct(@PathVariable Long id, @RequestParam int quantity)
//      → PUT /api/products/{id}/reserve?quantity=N
public interface ProductServiceClient {
    // This is a placeholder — replace with proper @FeignClient methods
    ProductDto getProductById(Long id);
    void reserveProduct(Long id, int quantity);
}

// ─── Task 4: OrderService using Feign clients ────────────────────────────────
@Service
public class OrderService {

    // TODO 4: Replace RestTemplate with injected UserServiceClient and ProductServiceClient
    private final RestTemplate restTemplate = new RestTemplate();  // OLD — remove this

    public OrderDto placeOrder(Long userId, Long productId, int quantity) {
        // TODO 4: Replace these RestTemplate calls with Feign client calls
        UserDto user = restTemplate.getForObject(
            "http://user-service/api/users/" + userId, UserDto.class);

        ProductDto product = restTemplate.getForObject(
            "http://product-service/api/products/" + productId, ProductDto.class);

        if (user == null || product == null) {
            throw new RuntimeException("Upstream service returned null");
        }

        // TODO 5: Wrap the getUserById call with @CircuitBreaker
        // Create a separate method getUserWithFallback(Long userId) that:
        //   - Is annotated @CircuitBreaker(name = "userService", fallbackMethod = "getUserFallback")
        //   - Has a fallback: getUserFallback(Long userId, Throwable t) that returns new UserDto(userId, "Unknown", false)

        restTemplate.put(
            "http://product-service/api/products/" + productId + "/reserve?quantity=" + quantity,
            null);

        return new OrderDto(userId, productId, quantity, user.getName(), product.getName());
    }
}

// ─── DTOs (read-only — do not modify) ────────────────────────────────────────
record UserDto(Long id, String name, boolean active) {}
record ProductDto(Long id, String name, double price) {}
record OrderDto(Long userId, Long productId, int quantity, String userName, String productName) {}
