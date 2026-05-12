// HTTP CLIENT — Solution

import { Injectable, Component, inject } from "@angular/core";
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { CommonModule, AsyncPipe } from "@angular/common";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface CreateProductRequest {
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

// ─── Tasks 1 & 2: ProductService ─────────────────────────────────────────────
@Injectable({ providedIn: "root" })
export class ProductService {
  private http = inject(HttpClient);
  private readonly baseUrl = "/api/products";

  getProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  getProduct(id: number): Observable<Product> {
    return this.http
      .get<Product>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Task 4: Query params with HttpParams
  searchProducts(
    category: string,
    page: number = 0,
  ): Observable<Page<Product>> {
    // HttpParams is immutable — each .set() returns a new instance
    const params = new HttpParams()
      .set("category", category)
      .set("page", page.toString())
      .set("size", "20");

    return this.http
      .get<Page<Product>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError));
  }

  createProduct(data: CreateProductRequest): Observable<Product> {
    return this.http
      .post<Product>(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Arrow function so 'this' context is preserved when passed as callback
  private handleError = (err: HttpErrorResponse): Observable<never> => {
    console.error("HTTP Error:", err);

    let message: string;
    if (err.status === 0) {
      message = "Network error — check your connection";
    } else if (err.status === 404) {
      message = "Product not found";
    } else if (err.status >= 500) {
      message = "Server error — please try again";
    } else {
      message = err.error?.message ?? "Request failed";
    }

    return throwError(() => new Error(message));
  };
}

// ─── Task 3: ProductListComponent with async pipe ─────────────────────────────
// The async pipe:
// - Subscribes to the observable automatically
// - Re-renders when new values arrive
// - Unsubscribes when the component is destroyed (no memory leak)
// - Works with Angular's change detection
@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <h2>Products</h2>

    <!-- async pipe subscribes and provides the value — no ngOnInit, no subscribe() -->
    @if (products$ | async; as products) {
      @for (product of products; track product.id) {
        <div class="product-card">
          <strong>{{ product.name }}</strong>
          <span>{{ product.price | currency }}</span>
          <span class="stock" [class.low]="product.stock < 5">
            {{ product.stock }} in stock
          </span>
        </div>
      } @empty {
        <p>No products available.</p>
      }
    } @else {
      <p>Loading products...</p>
    }
  `,
})
export class ProductListComponent {
  private productService = inject(ProductService);

  // Assign the Observable directly — no subscribe, no ngOnInit
  // The async pipe in the template handles the subscription
  products$ = this.productService.getProducts();
}
