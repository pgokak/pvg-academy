// BEAN SCOPES & LIFECYCLE — Starter Exercise
//
// TASK: Fix the scope and lifecycle issues below.
//
// YOUR TASKS:
// 1. Fix ShoppingCartService — change from singleton to session scope
//    Add proxyMode = ScopedProxyMode.TARGET_CLASS
// 2. Fix ConnectionService — move initialization from constructor to @PostConstruct
//    Add @PreDestroy for cleanup
// 3. Explain (in a comment) why proxyMode is required when injecting
//    a session-scoped bean into a singleton

package com.example.issuetracker.service;

import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Scope;

import java.util.*;

// ─── Task 1: Fix this service — wrong scope ───────────────────────────────────
// BUG: ShoppingCart is singleton — all users share the same cart items!
@Service  // TODO: Change to session scope with proxyMode
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

// ─── Task 2: Fix this service — wrong lifecycle ───────────────────────────────
@Service
public class ConnectionService {
    // BUG: initialization code in constructor — dependency may not be ready
    // Also: no cleanup when Spring shuts down

    private Object connection; // Simulated connection
    private final AppProperties config;

    public ConnectionService(AppProperties config) {
        // BUG: Calling config before @PostConstruct — unsafe
        this.connection = createConnection(config.getDbUrl()); // Should be in @PostConstruct
    }

    // TODO: Add @PostConstruct method that creates the connection safely

    // TODO: Add @PreDestroy method that closes the connection

    private Object createConnection(String url) {
        System.out.println("Connecting to: " + url);
        return new Object(); // Simulated
    }
}

// ─── Task 3: Explain proxyMode in a comment ──────────────────────────────────
// TODO: Explain below why proxyMode = ScopedProxyMode.TARGET_CLASS is necessary
// when a singleton (@Service OrderService) depends on a session-scoped bean (ShoppingCartService)
//
// Hint: Think about when the singleton is created vs when sessions are created.
// What does Spring inject into the singleton at startup time?
// What happens when there are 100 concurrent users?
