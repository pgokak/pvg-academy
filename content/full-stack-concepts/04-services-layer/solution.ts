// THE SERVICES LAYER — Solution

import { Component, OnInit, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { CommonModule } from "@angular/common";

// ─── Task 1: Product interface ───────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

// ─── Task 2: ProductService ──────────────────────────────────────────────────
// The service owns ALL product-related logic.
// Any component that needs products talks to this service — one place to change.
@Injectable({ providedIn: "root" })
export class ProductService {
  private readonly apiUrl = "/api/products";

  constructor(private http: HttpClient) {}

  // Business rule: "available" means stock > 0, sorted cheapest first
  getAvailableProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      map((products) =>
        products.filter((p) => p.stock > 0).sort((a, b) => a.price - b.price),
      ),
      catchError((err) => {
        console.error("Failed to load products", err);
        return of([]); // Return empty array on error — component doesn't crash
      }),
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    const params = new HttpParams().set("category", category);
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  createProduct(data: Omit<Product, "id">): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, data);
  }
}

// ─── Task 3: Clean component ──────────────────────────────────────────────────
// The component's ONLY job: coordinate UI state and delegate to the service.
// No HTTP calls, no business logic, no data transformation.
@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
    <ul>
      <li *ngFor="let product of products">
        {{ product.name }} — {{ product.price | currency }}
      </li>
    </ul>
    <p *ngIf="products.length === 0 && !errorMessage">No products available.</p>
  `,
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  errorMessage = "";

  // Inject service, not HttpClient — component doesn't care HOW data is fetched
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getAvailableProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (err) => {
        this.errorMessage = "Failed to load products";
      },
    });
  }
}

// ─── Bonus: Reuse in another component ───────────────────────────────────────
// Because logic lives in the service, a different component gets it for free
@Component({
  selector: "app-product-search",
  standalone: true,
  imports: [CommonModule],
  template: `
    <input (input)="onSearch($event)" placeholder="Search category..." />
    <ul>
      <li *ngFor="let product of results">{{ product.name }}</li>
    </ul>
  `,
})
export class ProductSearchComponent {
  results: Product[] = [];

  constructor(private productService: ProductService) {}

  onSearch(event: Event): void {
    const category = (event.target as HTMLInputElement).value;
    if (category.length < 2) return;
    // Same service, different method — zero code duplication
    this.productService
      .getProductsByCategory(category)
      .subscribe((products) => {
        this.results = products;
      });
  }
}
