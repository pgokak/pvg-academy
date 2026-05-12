---
title: "Signals"
version: "Angular 17+"
since: 2023
stable: true
---

## The Problem

```typescript
// Zone.js change detection: Angular re-checks every component in the tree
// even if only one tiny value changed — O(n) cost per interaction
export class CounterComponent {
  count = 0; // plain number — Angular has no way to know when it changed
  // It must check every binding in the entire tree on each tick
}
```

Zone.js works by monkey-patching browser APIs to detect any async activity, then triggering a full change detection cycle. For large apps, this means thousands of unnecessary comparisons. Signals give Angular precise, fine-grained reactivity — only the parts of the UI that read a changed signal are re-evaluated.

## Mental Model

A signal is a smart box that holds a value and notifies anyone who opened it when the value changes. Unlike a plain property, the signal tracks who reads it. When the value updates, Angular knows exactly which templates and computed values depend on it — no guessing, no full-tree scan.

## signal() — Creating and Updating State

```typescript
import { Component, signal, computed, effect } from '@angular/core';

@Component({ ... })
export class CounterComponent {
  // signal<T>(initialValue) creates a writable signal
  count = signal(0);
  step = signal(1);

  increment(): void {
    // .update() receives the current value and returns the new one
    this.count.update((n) => n + this.step());
  }

  decrement(): void {
    // .set() replaces the value directly
    this.count.set(this.count() - this.step());
  }

  reset(): void {
    this.count.set(0);
  }
}
```

Read a signal in templates and code the same way — call it like a function:

```html
<!-- template -->
<p>Count: {{ count() }}</p>
<button (click)="increment()">+{{ step() }}</button>
```

## computed() — Derived State

```typescript
export class CartComponent {
  items = signal<CartItem[]>([]);
  taxRate = signal(0.1);

  // computed() re-derives only when its dependencies (items, taxRate) change
  // It is lazy — only calculated when read, and memoised until dependencies change
  subtotal = computed(() => this.items().reduce((sum, i) => sum + i.price, 0));
  tax = computed(() => this.subtotal() * this.taxRate());
  total = computed(() => this.subtotal() + this.tax());
}
```

```html
<p>Subtotal: {{ subtotal() | currency }}</p>
<p>Tax ({{ taxRate() * 100 }}%): {{ tax() | currency }}</p>
<p><strong>Total: {{ total() | currency }}</strong></p>
```

## effect() — Reacting to Changes

`effect()` runs a side effect whenever any signal read inside it changes:

```typescript
import { Component, signal, effect, inject } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

@Component({ ... })
export class ThemeComponent {
  theme = signal<'light' | 'dark'>('light');
  private storage = inject(LocalStorageService);

  constructor() {
    // effect() runs once immediately, then re-runs whenever theme() changes
    effect(() => {
      // Any signal read here becomes a dependency automatically
      document.body.classList.toggle('dark', this.theme() === 'dark');
      this.storage.set('theme', this.theme());
    });
  }

  toggleTheme(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }
}
```

## Signal-Based Inputs and Outputs (Angular 17.1+)

```typescript
import { Component, input, output, computed } from "@angular/core";

@Component({ selector: "app-product-price", standalone: true, template: `...` })
export class ProductPriceComponent {
  // input() — parent sets the value via [price]="somePrice"
  price = input.required<number>();
  discount = input(0); // optional with default

  // computed() from signal inputs — reactive without ngOnChanges
  discountedPrice = computed(() => this.price() * (1 - this.discount()));
  savings = computed(() => this.price() - this.discountedPrice());

  // output() — replaces @Output() / EventEmitter
  purchased = output<number>(); // emits the final price

  buy(): void {
    this.purchased.emit(this.discountedPrice());
  }
}
```

## Signals vs RxJS

|                            | Signals                   | RxJS Observables            |
| -------------------------- | ------------------------- | --------------------------- |
| Synchronous by default     | Yes                       | No (async)                  |
| Always has a current value | Yes                       | Only BehaviorSubject        |
| Template binding           | Direct `()` call          | Needs `async` pipe          |
| Best for                   | UI state, computed values | Async streams, HTTP, events |
| Angular integration        | Native (no import)        | Needs `takeUntilDestroyed`  |

Use signals for state that the template displays. Use RxJS for HTTP calls, WebSockets, and complex event streams.

## Common Mistake

Mutating a signal's value directly instead of using `.set()` or `.update()` — Angular never sees the change:

```typescript
// WRONG: mutates the array in place — Angular doesn't detect this
this.items().push(newItem); // items signal never notified

// RIGHT: replace the reference so the signal fires its notifications
this.items.update((list) => [...list, newItem]);
```

## When to Reach For This

- Component UI state (counters, toggles, form values) — `signal()`
- Values derived from other signals — `computed()`
- Side effects tied to signal changes (localStorage, DOM, analytics) — `effect()`
- Signal-based component inputs and outputs — `input()` / `output()`
- Gradual migration — signals and RxJS interop via `toSignal()` and `toObservable()`
