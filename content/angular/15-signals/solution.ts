// SIGNALS — Solution

import { Component, signal, computed, effect } from "@angular/core";
import { CommonModule } from "@angular/common";

interface CartItem {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart">
      <h2>Cart ({{ count() }} item{{ count() === 1 ? "" : "s" }})</h2>

      <ul *ngIf="items().length > 0; else empty">
        <!-- Read the signal in the template with () -->
        <li *ngFor="let item of items()">
          {{ item.name }} — {{ item.price | currency }}
          <button (click)="removeItem(item.id)">Remove</button>
        </li>
      </ul>

      <ng-template #empty><p>Your cart is empty.</p></ng-template>

      <!-- computed() values are read the same way — call as a function -->
      <p>Subtotal: {{ total() | currency }}</p>
      <p *ngIf="discount() > 0">
        Discount ({{ discount() * 100 }}%): -{{
          total() * discount() | currency
        }}
      </p>
      <p>
        <strong>Total: {{ discountedTotal() | currency }}</strong>
      </p>

      <div class="actions">
        <button (click)="addSampleItem()">Add Sample Item</button>
        <label>
          Discount:
          <select (change)="setDiscount(+$any($event.target).value)">
            <option value="0">None</option>
            <option value="0.1">10%</option>
            <option value="0.2">20%</option>
          </select>
        </label>
      </div>
    </div>
  `,
  styles: [
    `
      .cart {
        padding: 16px;
        max-width: 400px;
        font-family: sans-serif;
      }
      ul {
        list-style: none;
        padding: 0;
      }
      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }
      button {
        padding: 4px 8px;
        cursor: pointer;
      }
      .actions {
        margin-top: 12px;
        display: flex;
        gap: 12px;
        align-items: center;
      }
    `,
  ],
})
export class CartComponent {
  // Task 1: signal() holds the array. Always replace, never mutate.
  items = signal<CartItem[]>([]);

  // Task 6 (BONUS): discount is independently changeable state → signal
  discount = signal(0);

  // Task 2: computed() is memoised — only re-calculates when items() changes
  count = computed(() => this.items().length);
  total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price, 0),
  );

  // Task 6 (BONUS): discountedTotal depends on two signals — computed tracks both
  discountedTotal = computed(() => this.total() * (1 - this.discount()));

  constructor() {
    // Task 5: effect() runs immediately, then re-runs whenever any signal read inside changes
    // Here it reads items() and total(), so it fires on any cart change
    effect(() => {
      console.log(
        `Cart updated: ${this.count()} items, $${this.total().toFixed(2)}`,
      );
    });
  }

  addItem(item: CartItem): void {
    // Task 3: .update() receives the current array and must return a NEW array
    // Spread operator creates a new reference — signal detects the change
    this.items.update((list) => [...list, item]);
    // NEVER do: this.items().push(item) — mutates in place, signal not notified
  }

  removeItem(id: number): void {
    // Task 4: filter also returns a new array — safe for signals
    this.items.update((list) => list.filter((item) => item.id !== id));
  }

  setDiscount(value: number): void {
    this.discount.set(value);
  }

  private nextId = 1;
  addSampleItem(): void {
    const samples = ["Keyboard", "Mouse", "Monitor", "Headset", "Webcam"];
    const prices = [79, 39, 299, 89, 59];
    const idx = (this.nextId - 1) % samples.length;
    this.addItem({ id: this.nextId++, name: samples[idx], price: prices[idx] });
  }
}
