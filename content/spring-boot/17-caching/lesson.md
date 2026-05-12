---
title: "Caching with Spring Cache"
version: "Spring Boot 3.x"
since: 2011
stable: true
---

## The Problem

```java
@Service
public class ProductService {

    public Product findById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException(id));
        // This query runs EVERY TIME — even for the same product
        // 200ms per call × 1000 concurrent users = database overwhelmed
        // Fetching the same static product catalog data 10,000 times per minute
    }
}
```

The same expensive query runs on every single request. The database is doing the same work repeatedly for data that barely changes — CPU, connections, and time wasted.

## Mental Model

A cache is a sticky note on your desk. Instead of walking to the filing cabinet every time, you check your note first. If the answer is there, you're done. If not, you go get it and write a new note for next time. The filing cabinet (database) only gets visited when the sticky note doesn't have the answer.

## @EnableCaching — Turn It On

```java
@SpringBootApplication
@EnableCaching  // Required — activates Spring's cache infrastructure
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## @Cacheable — Cache the Result

```java
@Service
public class ProductService {

    // First call: runs the method, stores the result under key=id
    // Subsequent calls with the same id: returns cached result, method body NEVER runs
    @Cacheable("products")
    public Product findById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }

    // Cache with explicit key expression (SpEL)
    @Cacheable(value = "products", key = "#id")
    public Product getProduct(Long id) { ... }

    // Conditional caching — only cache if the product is published
    @Cacheable(value = "products", condition = "#result != null && #result.published")
    public Product findPublishedProduct(Long id) { ... }
}
```

## @CacheEvict — Remove Stale Data

```java
@Service
public class ProductService {

    // After update: remove the old cached value so next read fetches fresh data
    @CacheEvict(value = "products", key = "#product.id")
    public Product updateProduct(Product product) {
        return productRepository.save(product);
    }

    // After delete: remove from cache
    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // Nuke the entire cache (use with care — expensive to repopulate)
    @CacheEvict(value = "products", allEntries = true)
    public void clearProductCache() {}
}
```

## @CachePut — Always Update the Cache

```java
@Service
public class ProductService {

    // @CachePut ALWAYS runs the method AND updates the cache
    // Unlike @Cacheable, it never skips execution
    // Use when you want the cache to reflect the latest saved state
    @CachePut(value = "products", key = "#result.id")
    public Product createProduct(Product product) {
        return productRepository.save(product);  // always runs
        // Return value is stored in cache under the new product's ID
    }
}
```

| Annotation    | Runs method body?          | Cache behavior               |
| ------------- | -------------------------- | ---------------------------- |
| `@Cacheable`  | Only if cache miss         | Read-through: skip if cached |
| `@CachePut`   | Always                     | Write-through: always update |
| `@CacheEvict` | Yes (eviction side effect) | Remove entry from cache      |

## Cache Providers

| Provider         | Use case                | Setup                                         |
| ---------------- | ----------------------- | --------------------------------------------- |
| Simple (default) | Development only        | None — auto-configured with ConcurrentHashMap |
| Caffeine         | Production, in-memory   | `spring-boot-starter-cache` + caffeine dep    |
| Redis            | Production, distributed | `spring-boot-starter-data-redis`              |

```yaml
# Redis configuration (application.yml)
spring:
  cache:
    type: redis
    redis:
      time-to-live: 600000  # 10 minutes in milliseconds
  data:
    redis:
      host: localhost
      port: 6379

# Caffeine configuration (in-memory, high performance)
spring:
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=1000,expireAfterWrite=10m
```

```java
// Caffeine — explicit config for fine-grained control
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("products", "users");
        manager.setCaffeine(
            Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(Duration.ofMinutes(10))
                .recordStats()  // Enable hit/miss metrics
        );
        return manager;
    }
}
```

## When NOT to Cache

- **Frequently changing data** — order status, live inventory counts
- **User-specific data without key isolation** — always include `userId` in the cache key
- **Security-sensitive data** — user passwords, payment details
- **Very large result sets** — caching 100MB query results wastes heap

## Common Mistake

Forgetting `@CacheEvict` on update and delete methods — the cache serves stale data indefinitely:

```java
// BROKEN — cache never evicted
@Service
public class ProductService {

    @Cacheable("products")
    public Product findById(Long id) { ... }

    // No @CacheEvict — after update, findById() still returns the OLD product
    public Product updateProduct(Product product) {
        return productRepository.save(product);
        // DB has the new data. Cache has the old data. They're out of sync forever.
    }
}

// RIGHT — evict on every mutation
@CacheEvict(value = "products", key = "#product.id")
public Product updateProduct(Product product) {
    return productRepository.save(product);
}
```

## When to Reach For This

- Reference data that rarely changes: product catalog, country lists, config values
- Expensive computations or aggregations that many users request
- External API responses you're willing to accept as slightly stale
- User profile or permission data fetched on every authenticated request
- Any method where profiling shows repeated identical DB calls
