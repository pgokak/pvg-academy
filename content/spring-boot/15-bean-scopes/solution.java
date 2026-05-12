// BEAN SCOPES & LIFECYCLE — Solution

package com.example.issuetracker.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Service;
import org.springframework.web.context.WebApplicationContext;

import java.util.*;

// ─── Task 1: Session-scoped shopping cart ────────────────────────────────────
// Each user session gets its own ShoppingCartService instance.
// proxyMode = TARGET_CLASS is required when injecting into singleton beans:
//   - Spring creates a proxy object at startup (no real instance yet)
//   - When a method is called, the proxy routes to the CURRENT SESSION'S instance
//   - Without the proxy, Spring can't create the singleton (no session exists at startup)
@Service
@Scope(
    value = WebApplicationContext.SCOPE_SESSION,
    proxyMode = ScopedProxyMode.TARGET_CLASS  // Required for injection into singletons
)
public class ShoppingCartService {
    private final List<CartItem> items = new ArrayList<>();

    public void addItem(String name, int quantity, double price) {
        items.add(new CartItem(name, quantity, price));
    }

    public List<CartItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    public double getTotal() {
        return items.stream()
            .mapToDouble(item -> item.price() * item.quantity())
            .sum();
    }

    public void clear() {
        items.clear();
    }

    record CartItem(String name, int quantity, double price) {}
}

// ─── Task 2: Proper bean lifecycle with @PostConstruct / @PreDestroy ─────────
@Service
public class ConnectionService {
    private Object connection; // Simulated connection resource
    private final AppProperties config;

    // Constructor: ONLY assign injected dependencies
    // config is injected here — but don't USE it yet
    public ConnectionService(AppProperties config) {
        this.config = config;
        // Don't call config.getDbUrl() here — not safe until all injection is complete
    }

    // @PostConstruct: all dependencies injected, safe to initialize
    @PostConstruct
    public void initialize() {
        this.connection = createConnection(config.getDbUrl());
        System.out.println("ConnectionService initialized successfully");
    }

    // @PreDestroy: called when Spring context shuts down — release resources
    @PreDestroy
    public void shutdown() {
        if (connection != null) {
            System.out.println("Closing connection...");
            // connection.close(); in a real implementation
            this.connection = null;
        }
    }

    private Object createConnection(String url) {
        System.out.println("Connecting to: " + url);
        return new Object();
    }
}

// ─── Task 3: proxyMode explanation ───────────────────────────────────────────
/*
WHY proxyMode = ScopedProxyMode.TARGET_CLASS IS REQUIRED:

Timeline without proxyMode:
  1. Application starts
  2. Spring creates OrderService (singleton) — exists for application lifetime
  3. Spring tries to inject ShoppingCartService into OrderService
  4. PROBLEM: No HTTP sessions exist at startup! Spring can't create a session-scoped bean.
  5. Spring throws: Cannot create session-scoped bean while not in a web request

Timeline WITH proxyMode = TARGET_CLASS:
  1. Application starts
  2. Spring creates OrderService (singleton)
  3. Spring injects a PROXY for ShoppingCartService (not a real instance)
     - The proxy is a generated subclass that looks like ShoppingCartService
     - It's just a routing stub, not a real cart
  4. When a user makes a request (session exists):
     - cart.addItem() is called on the proxy
     - Proxy looks up "which session am I in?"
     - Proxy routes the call to THAT session's ShoppingCartService instance
     - Each of 1000 concurrent users gets routed to their own instance

Without the proxy, Spring can't inject a session bean into a singleton.
With the proxy, the singleton holds a routing stub, not an actual instance.
*/
