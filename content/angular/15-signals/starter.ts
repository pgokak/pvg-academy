// SIGNALS — Starter Exercise
//
// TASK: Build a shopping cart using Angular Signals.
//
// YOUR TASKS:
// 1. Replace the plain array 'items' with a signal<CartItem[]>([])
// 2. Replace 'count' and 'total' with computed() that derive from items()
// 3. Implement addItem() using items.update() — do NOT push() directly
// 4. Implement removeItem() using items.update() with filter
// 5. Add an effect() that logs to the console whenever the cart changes
// 6. BONUS: add a 'discount' signal and a 'discountedTotal' computed()

// Assume these imports are available:
// import { Component, signal, computed, effect } from '@angular/core';
// import { CommonModule } from '@angular/common';

interface CartItem {
  id: number;
  name: string;
  price: number;
}

// @Component({ selector: 'app-cart', standalone: true, imports: [CommonModule], template: `...` })
export class CartComponent {
  // TODO: Task 1 — replace these with signal()
  items: CartItem[] = [];

  // TODO: Task 2 — replace these with computed()
  count = 0; // should equal items().length
  total = 0; // should equal sum of item.price

  // TODO: Task 6 (BONUS) — add discount signal (default 0.0 = no discount)
  // TODO: Task 6 (BONUS) — add discountedTotal computed

  constructor() {
    // TODO: Task 5 — add an effect() that logs 'Cart updated: X items, $Y' to the console
  }

  addItem(item: CartItem): void {
    // TODO: Task 3 — use items.update() to add the item
    // WRONG pattern (do not do this): this.items.push(item)
  }

  removeItem(id: number): void {
    // TODO: Task 4 — use items.update() with .filter()
  }
}
