// COMPONENT COMMUNICATION — Solution

import {
  Component,
  Input,
  Output,
  EventEmitter,
  input,
  output,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";

interface Product {
  id: number;
  name: string;
  price: number;
}

// --- Decorator-based (classic) approach ---

@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h3>{{ product.name }}</h3>
      <p class="price">\${{ product.price }}</p>
      <button (click)="onAddToCart()">Add to Cart</button>
    </div>
  `,
  styles: [
    `
      .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 16px;
        margin: 8px;
        display: inline-block;
        width: 160px;
      }
      .price {
        color: #4caf50;
        font-weight: bold;
      }
      button {
        padding: 6px 12px;
        cursor: pointer;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
      }
    `,
  ],
})
export class ProductCardComponent {
  // Task 1: @Input({ required: true }) makes the binding mandatory at compile time
  @Input({ required: true }) product!: Product;

  // Task 2: EventEmitter<T> — T is the type the parent receives in $event
  @Output() addToCart = new EventEmitter<Product>();

  onAddToCart(): void {
    // Task 3: emit a shallow copy so parent can't mutate our local reference
    this.addToCart.emit({ ...this.product });
  }
}

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="container">
      <h2>Products — Cart: {{ cartCount }} item(s)</h2>
      <div class="grid">
        <!-- Task 4: [product]="p" passes each product down via @Input -->
        <!-- Task 5: (addToCart) listens for the child's EventEmitter emission -->
        <app-product-card
          *ngFor="let p of products"
          [product]="p"
          (addToCart)="handleAddToCart($event)"
        />
      </div>
      <div class="cart" *ngIf="cart.length > 0">
        <h3>Cart</h3>
        <ul>
          <li *ngFor="let item of cart">
            {{ item.name }} — \${{ item.price }}
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 16px;
        font-family: sans-serif;
      }
      .grid {
        display: flex;
        flex-wrap: wrap;
      }
      .cart {
        margin-top: 16px;
        border-top: 2px solid #eee;
        padding-top: 16px;
      }
    `,
  ],
})
export class ProductListComponent {
  products: Product[] = [
    { id: 1, name: "Keyboard", price: 79 },
    { id: 2, name: "Mouse", price: 39 },
    { id: 3, name: "Monitor", price: 299 },
  ];

  cartCount = 0;
  cart: Product[] = [];

  handleAddToCart(product: Product): void {
    this.cart.push(product);
    this.cartCount++;
  }
}

// --- Signal-based approach (BONUS — Angular 17.1+) ---

@Component({
  selector: "app-product-card-signals",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <!-- Read signal inputs with () -->
      <h3>{{ product().name }}</h3>
      <p class="price">\${{ product().price }}</p>
      <!-- computed() automatically derives discounted price -->
      <p class="discount">
        10% off: \${{ discountedPrice() | number: "1.2-2" }}
      </p>
      <button (click)="onAddToCart()">Add to Cart</button>
    </div>
  `,
  styles: [
    `
      .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 16px;
        margin: 8px;
        display: inline-block;
        width: 180px;
      }
      .price {
        color: #4caf50;
        font-weight: bold;
      }
      .discount {
        color: #e67e22;
        font-size: 0.85rem;
      }
      button {
        padding: 6px 12px;
        cursor: pointer;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
      }
    `,
  ],
})
export class ProductCardSignalsComponent {
  // input() returns a readonly Signal<T> — the parent sets it, the child reads it
  product = input.required<Product>();
  showPrice = input(true); // optional with default

  // output() replaces EventEmitter — same (addToCart)="..." binding in the template
  addToCart = output<Product>();

  // computed() re-derives whenever product() changes — no manual subscriptions
  discountedPrice = computed(() => this.product().price * 0.9);

  onAddToCart(): void {
    // Read the signal with () then emit a copy
    this.addToCart.emit({ ...this.product() });
  }
}
