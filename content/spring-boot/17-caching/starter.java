// CACHING WITH SPRING CACHE — Starter Exercise
//
// SCENARIO: A ProductService that hits the database on every call.
// The product catalog is read-heavy and rarely changes.
//
// YOUR TASKS:
// 1. Add @EnableCaching to the Application class (shown below as a comment block)
// 2. Add @Cacheable("products") to findById() — cache by product ID
// 3. Add @Cacheable(value = "products", key = "#root.methodName") to findAll()
//    — cache the full list under a fixed key
// 4. Add @CachePut(value = "products", key = "#result.id") to updateProduct()
//    — always run and update the cache
// 5. Add @CacheEvict(value = "products", key = "#id") to deleteProduct()
// 6. Add @CacheEvict(value = "products", allEntries = true) to clearCache()

package com.example.shop.service;

import com.example.shop.model.Product;
import com.example.shop.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// TODO 1: @EnableCaching goes on the main Application class or a @Configuration class
// (Add it there, not here — this is just a reminder)

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // TODO 2: Add @Cacheable("products")
    // First call with id=5 queries the DB and stores the result.
    // Second call with id=5 returns the cached result — DB not queried.
    public Product findById(Long id) {
        System.out.println("Fetching product " + id + " from database...");
        return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    // TODO 3: Add @Cacheable with a fixed key (not the argument)
    // Use key = "#root.methodName" so the list is cached under "findAll"
    public List<Product> findAll() {
        System.out.println("Fetching all products from database...");
        return productRepository.findAll();
    }

    // TODO 4: Add @CachePut(value = "products", key = "#result.id")
    // The method ALWAYS runs (unlike @Cacheable) and the saved product is put into cache.
    public Product updateProduct(Product product) {
        System.out.println("Updating product " + product.getId() + " in database...");
        return productRepository.save(product);
    }

    // TODO 5: Add @CacheEvict(value = "products", key = "#id")
    // Remove the cached entry for this specific product after deletion.
    public void deleteProduct(Long id) {
        System.out.println("Deleting product " + id + " from database...");
        productRepository.deleteById(id);
    }

    // TODO 6: Add @CacheEvict(value = "products", allEntries = true)
    // Wipe all entries from the "products" cache (e.g., after a bulk import).
    public void clearCache() {
        System.out.println("Clearing product cache...");
        // No DB operation — just evicts all cached products
    }
}
