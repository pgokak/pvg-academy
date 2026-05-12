// CACHING WITH SPRING CACHE — Solution

package com.example.shop.service;

import com.example.shop.model.Product;
import com.example.shop.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

import java.util.List;

// ─── Enable caching in configuration ─────────────────────────────────────────
// Task 1: @EnableCaching activates Spring's proxy-based caching infrastructure
// Place on @Configuration or @SpringBootApplication class
@Configuration
@EnableCaching
public class CacheConfig {
    // Cache manager auto-configured (Simple/Redis/Caffeine based on classpath + application.yml)
    // For production, add Redis or Caffeine dependency and configure in application.yml
}

// ─── Cached ProductService ────────────────────────────────────────────────────
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Task 2: @Cacheable — cache miss runs method and stores result; cache hit skips method
    // Default key = method arguments (id in this case)
    @Cacheable("products")
    public Product findById(Long id) {
        System.out.println("Fetching product " + id + " from database...");
        return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    // Task 3: Fixed key so the list is cached as a single entry under "findAll"
    // Without a fixed key, each unique argument would be cached separately
    @Cacheable(value = "products", key = "#root.methodName")
    public List<Product> findAll() {
        System.out.println("Fetching all products from database...");
        return productRepository.findAll();
    }

    // Task 4: @CachePut — ALWAYS runs the method body AND stores the result
    // Use after save/update so the cache reflects the latest persisted state
    // key = "#result.id" uses the returned product's ID as the cache key
    @CachePut(value = "products", key = "#result.id")
    public Product updateProduct(Product product) {
        System.out.println("Updating product " + product.getId() + " in database...");
        return productRepository.save(product);
    }

    // Task 5: @CacheEvict — removes specific entry after deletion
    // Without this, findById(id) would return a deleted product from cache
    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(Long id) {
        System.out.println("Deleting product " + id + " from database...");
        productRepository.deleteById(id);
    }

    // Task 6: allEntries = true — wipe the entire "products" cache namespace
    // Useful after bulk operations or admin-triggered refreshes
    @CacheEvict(value = "products", allEntries = true)
    public void clearCache() {
        System.out.println("Clearing product cache...");
    }
}
