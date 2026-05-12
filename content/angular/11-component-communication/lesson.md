---
title: "Component Communication"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```typescript
// Without a clear communication contract, components become tightly coupled
export class ParentComponent {
  child: any; // grab a reference to the child directly

  doSomething() {
    this.child.internalState = "hacked"; // directly mutating child internals
    this.child.privateMethod(); // calling private methods from outside
  }
}
// The child has no idea who is changing it or why — bugs are invisible
```

When components reach into each other's internals, changes in one break the other silently. You need a formal boundary.

## Mental Model

Think of components as appliances and their inputs/outputs as sockets and switches. A lamp has a power socket (`@Input`) — you plug in electricity, it lights up. It also has a switch that controls a signal back to the wall (`@Output`). The lamp doesn't need to know who is providing the power, and the wall doesn't need to know how the lamp works internally. The socket/switch pair is the contract.

## @Input — Parent Passes Data Down

```typescript
// child.component.ts
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-product-card', ... })
export class ProductCardComponent {
  // Parent sets this via [product]="selectedProduct"
  @Input({ required: true }) product!: Product;

  // Optional input with a default value
  @Input() showPrice = true;
}
```

```html
<!-- parent.component.html -->
<app-product-card [product]="featuredProduct" [showPrice]="false" />
```

## @Output — Child Notifies Parent

```typescript
// child.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-product-card', ... })
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  // EventEmitter<T> — T is the type of the payload emitted to the parent
  @Output() addToCart = new EventEmitter<Product>();
  @Output() deleted = new EventEmitter<number>(); // emits the product id

  onAddToCart(): void {
    this.addToCart.emit(this.product); // parent receives the product
  }
}
```

```html
<!-- parent.component.html — (addToCart) is the EventEmitter's name -->
<app-product-card [product]="p" (addToCart)="handleAddToCart($event)" />
```

## Signal-Based Inputs (Angular 17.1+)

Angular 17.1 introduced signal-based `input()` and `output()` — a modern alternative to decorators:

```typescript
import { Component, input, output, computed } from '@angular/core';

@Component({ ... })
export class ProductCardComponent {
  // input() returns a Signal<T> — read it like a function call: this.product()
  product = input.required<Product>();
  showPrice = input(true); // default value

  // output() replaces @Output / EventEmitter
  addToCart = output<Product>();

  // computed() derives a value from the signal — re-runs automatically
  discountedPrice = computed(() => this.product().price * 0.9);

  onAddToCart(): void {
    this.addToCart.emit(this.product()); // note the () to read the signal
  }
}
```

Signal inputs are read-only by design — the parent sets the value; the child only reads it. No mutation accidents.

## viewChild — Accessing a Child Component

```typescript
import { Component, viewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({ ... })
export class ParentComponent implements AfterViewInit {
  // Signal-based viewChild — available after the view is initialised
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvasRef');

  ngAfterViewInit(): void {
    const ctx = this.canvas().nativeElement.getContext('2d');
    // draw...
  }
}
```

## Common Mistake

Emitting an object reference instead of a copy — the parent and child then share the same object, and mutations in one silently affect the other:

```typescript
// WRONG: parent receives the same reference — mutations bleed through
this.productChanged.emit(this.product);
this.product.price = 0; // parent sees the changed price too!

// RIGHT: emit a shallow copy (or deep copy for nested objects)
this.productChanged.emit({ ...this.product });
```

## When to Reach For This

- Direct parent → child data flow — `@Input` / `input()`
- Child notifying a parent of an event — `@Output` / `output()`
- Sibling communication or deep trees — use a shared service with a `Subject` or `signal`
- Reading a child's DOM element or component instance — `viewChild()`
