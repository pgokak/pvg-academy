// PIPES — Solution

import { Pipe, PipeTransform, Component, inject } from "@angular/core";
import {
  CommonModule,
  AsyncPipe,
  CurrencyPipe,
  UpperCasePipe,
} from "@angular/common";
import { Observable, of } from "rxjs";

// ─── Task 1: TruncatePipe ─────────────────────────────────────────────────────
@Pipe({
  name: "truncate",
  pure: true, // Only re-runs when input reference changes — good for performance
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    maxLength = 50,
    suffix = "...",
  ): string {
    if (!value) return "";
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + suffix;
  }
}

// ─── Task 2: TimeAgoPipe ─────────────────────────────────────────────────────
@Pipe({
  name: "timeAgo",
  pure: false, // Impure: re-runs on every change detection cycle (needed for live "X minutes ago")
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | null | undefined): string {
    if (!value) return "";

    const date = value instanceof Date ? value : new Date(value);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }
    const days = Math.floor(seconds / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
}

// ─── Task 3: Component using multiple pipes ───────────────────────────────────
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  createdAt: Date;
}

@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [
    CommonModule, // Includes date, currency, uppercase, etc.
    AsyncPipe, // For async pipe on Observable
    TruncatePipe, // Custom pipe
    TimeAgoPipe, // Custom pipe
  ],
  template: `
    <div class="product-card">
      <!-- uppercase built-in + custom truncate (piped together) -->
      <h3>{{ product.name | uppercase | truncate: 20 }}</h3>

      <!-- currency with locale formatting -->
      <p class="price">
        {{ product.price | currency: "USD" : "symbol" : "1.2-2" }}
      </p>

      <!-- truncate with custom suffix -->
      <p class="desc">
        {{ product.description | truncate: 80 : "… read more" }}
      </p>

      <!-- custom timeAgo pipe -->
      <small>Posted {{ product.createdAt | timeAgo }}</small>

      <!-- date built-in -->
      <small>{{ product.createdAt | date: "longDate" }}</small>

      <!-- async pipe — subscribe in template, auto-unsubscribe -->
      @if (relatedProducts$ | async; as related) {
        <h4>Related ({{ related.length }})</h4>
        @for (r of related; track r.id) {
          <span>{{ r.name | truncate: 15 }}</span>
        }
      }
    </div>
  `,
})
export class ProductCardComponent {
  product: Product = {
    id: 1,
    name: "Wireless Noise-Cancelling Headphones with Premium Sound Quality",
    price: 299.99,
    description:
      "Experience exceptional audio quality with our premium wireless headphones. Features include 40-hour battery life, active noise cancellation, and premium drivers.",
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
  };

  // Observable — async pipe handles subscribe/unsubscribe
  relatedProducts$: Observable<Product[]> = of([
    {
      id: 2,
      name: "Bluetooth Speaker",
      price: 89.99,
      description: "",
      createdAt: new Date(),
    },
    {
      id: 3,
      name: "USB-C Cable Premium",
      price: 19.99,
      description: "",
      createdAt: new Date(),
    },
  ]);
}
