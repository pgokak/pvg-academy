// THE SERVICES LAYER — Starter Exercise
//
// PROBLEM: ProductListComponent is doing too much.
// It makes HTTP calls, transforms data, and handles UI — all in one place.
// The filtering and sorting logic can't be reused in ProductSearchComponent.
//
// YOUR TASKS:
// 1. Create a Product interface with: id, name, price, stock, category
// 2. Create a ProductService that:
//    - Injects HttpClient
//    - Has getAvailableProducts(): Observable<Product[]>
//      (fetches /api/products, filters out stock === 0, sorts by price ascending)
//    - Has getProductsByCategory(category: string): Observable<Product[]>
//      (fetches /api/products?category=X)
//    - Has createProduct(data: Omit<Product, 'id'>): Observable<Product>
// 3. Refactor ProductListComponent to use ProductService
//    - Remove all direct fetch/HTTP calls from the component
//    - The component should only subscribe and store results

// Assume these imports are available:
// import { Component, OnInit, Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { map, catchError } from 'rxjs/operators';
// import { of } from 'rxjs';

// ─── Task 1: Product interface ───────────────────────────────────────────────
// TODO: define Product interface

// ─── Task 2: ProductService ──────────────────────────────────────────────────
// TODO: implement ProductService with the three methods above

// ─── Task 3: Refactor the component ─────────────────────────────────────────
// BEFORE (bad — everything in the component):
// @Component({ selector: 'app-product-list', standalone: true, template: `...` })
// export class ProductListComponent implements OnInit {
//   products: any[] = [];
//   errorMessage = '';
//
//   ngOnInit(): void {
//     fetch('/api/products')
//       .then(r => {
//         if (!r.ok) throw new Error('Failed to load');
//         return r.json();
//       })
//       .then(data => {
//         // Business logic mixed into the component
//         this.products = data
//           .filter((p: any) => p.stock > 0)
//           .sort((a: any, b: any) => a.price - b.price);
//       })
//       .catch(err => {
//         this.errorMessage = err.message;
//       });
//   }
// }

// TODO: Create the AFTER version of ProductListComponent
// - Inject ProductService (not HttpClient directly)
// - In ngOnInit, call productService.getAvailableProducts()
// - Subscribe and assign to this.products
// - Handle errors by setting this.errorMessage
// - Keep the component's template simple: list the product names and prices
