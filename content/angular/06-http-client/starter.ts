// HTTP CLIENT — Starter Exercise
//
// TASK: Implement a complete ProductService using Angular HttpClient.
//
// API:
//   GET    /api/products                 → Product[]
//   GET    /api/products/:id             → Product
//   GET    /api/products?category=X&page=N → Page<Product>
//   POST   /api/products                 → Product
//   DELETE /api/products/:id             → void
//
// YOUR TASKS:
// 1. Implement all 5 methods with proper typing
// 2. Add error handling to each method using catchError
// 3. Write ProductListComponent using the async pipe (no subscribe in class)
// 4. Add a search method that uses HttpParams for query params

// Assume these imports are available:
// import { Injectable, Component, inject } from '@angular/core';
// import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError, of } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { CommonModule, AsyncPipe } from '@angular/common';

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

// ─── Task 1 & 2: ProductService ───────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class ProductService {
//   private http = inject(HttpClient);
//
//   // TODO: getProducts(): Observable<Product[]>
//   // TODO: getProduct(id: number): Observable<Product>
//   // TODO: searchProducts(category: string, page: number): Observable<Page<Product>>
//   //       Use HttpParams to build the query string
//   // TODO: createProduct(data: CreateProductRequest): Observable<Product>
//   // TODO: deleteProduct(id: number): Observable<void>
//
//   // TODO: private handleError(err: HttpErrorResponse): Observable<never>
//   //       Log the error, return throwError with user-friendly message
// }

// ─── Task 3: ProductListComponent with async pipe ─────────────────────────────
// @Component({
//   selector: 'app-product-list',
//   standalone: true,
//   imports: [CommonModule, AsyncPipe],
//   template: `
//     <!-- TODO: Use async pipe to display products from products$ observable -->
//     <!-- Show loading state, error state, and product list -->
//   `
// })
// export class ProductListComponent {
//   private productService = inject(ProductService);
//   products$ = ???; // TODO: assign the observable from the service
// }
