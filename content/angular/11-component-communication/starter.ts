// COMPONENT COMMUNICATION — Starter Exercise
//
// TASK: Wire up a parent-child product list with proper @Input / @Output.
//
// YOUR TASKS:
// 1. Add @Input({ required: true }) product to ProductCardComponent
// 2. Add @Output() addToCart = new EventEmitter<Product>() to ProductCardComponent
// 3. Call addToCart.emit(this.product) in the onAddToCart() method
// 4. In ProductListComponent, pass [product]="p" to the card
// 5. Bind (addToCart)="handleAddToCart($event)" on the card
// 6. BONUS: Convert to signal-based input() and output()

// Assume these imports are available:
// import { Component, Input, Output, EventEmitter, input, output, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  name: string;
  price: number;
}

// --- Child Component ---
// @Component({ selector: 'app-product-card', standalone: true, imports: [CommonModule], template: `...` })
export class ProductCardComponent {
  // TODO: Task 1 — add @Input({ required: true }) product
  // TODO: Task 2 — add @Output() addToCart EventEmitter

  onAddToCart(): void {
    // TODO: Task 3 — emit the product
  }
}

// --- Parent Component ---
// @Component({
//   selector: 'app-product-list',
//   standalone: true,
//   imports: [CommonModule, ProductCardComponent],
//   template: `
//     <h2>Products (cart: {{ cartCount }})</h2>
//     <!-- TODO: Task 4 — *ngFor over products, pass [product] binding -->
//     <!-- TODO: Task 5 — bind (addToCart) event -->
//   `
// })
export class ProductListComponent {
  products: Product[] = [
    { id: 1, name: "Keyboard", price: 79 },
    { id: 2, name: "Mouse", price: 39 },
    { id: 3, name: "Monitor", price: 299 },
  ];

  cartCount = 0;
  cart: Product[] = [];

  handleAddToCart(product: Product): void {
    // TODO: push product to cart, increment cartCount
  }
}
