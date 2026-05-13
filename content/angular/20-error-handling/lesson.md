---
title: "Error Handling"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

Every component handles errors differently. One shows an alert, another logs to console, a third silently fails. One HTTP call has a try/catch, another has a `.catch()`, another just lets errors propagate. When the network goes down, 10 different error messages appear in 10 different styles. Users are confused; debugging is impossible.

```typescript
// Service A
// getUserById(id: string): Observable<User> {
//   return this.http.get<User>(`/api/users/${id}`);
//   // No error handling — error propagates to component
// }

// Component A — handles error its own way
// ngOnInit(): void {
//   this.userService.getUserById(this.id).subscribe({
//     error: e => alert('Error loading user: ' + e.message) // alert? really?
//   });
// }

// Component B — different approach
// ngOnInit(): void {
//   this.productService.getProducts().subscribe({
//     error: e => console.log(e) // silent log — user sees nothing
//   });
// }
// Result: 10 components, 10 error patterns, zero consistency
```

## Mental Model

A global error handler is an air traffic control tower. Instead of each pilot handling emergencies differently, everything routes to one place with a consistent response plan.

At the service layer, errors are translated from HTTP codes into user-facing messages. The interceptor catches HTTP-level issues before they even reach services. The global `ErrorHandler` catches anything that slips through — the last line of defense.

## catchError in Services — Transform HTTP Errors

Transform low-level HTTP errors into meaningful, user-friendly messages at the source:

```typescript
// import { Injectable, inject } from '@angular/core';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Observable, catchError, throwError } from 'rxjs';

// @Injectable({ providedIn: 'root' })
class ProductService {
  // private http = inject(HttpClient);

  // getProducts(): Observable<Product[]> {
  //   return this.http.get<Product[]>('/api/products').pipe(
  //     catchError((error: HttpErrorResponse) => this.handleError(error))
  //   );
  // }

  private handleError(error: HttpErrorResponse): ReturnType<typeof throwError> {
    let userMessage: string;

    if (error.status === 0) {
      // Network error — no response received
      userMessage = "Cannot connect to server. Check your internet connection.";
    } else if (error.status === 404) {
      userMessage = "The requested resource was not found.";
    } else if (error.status === 403) {
      userMessage = "You do not have permission to perform this action.";
    } else if (error.status >= 500) {
      userMessage = "A server error occurred. Please try again later.";
    } else {
      userMessage = error.message || "An unexpected error occurred.";
    }

    console.error(`[ProductService] HTTP ${error.status}:`, error);
    // In production: this.errorTracker.captureException(error);

    return throwError(() => new Error(userMessage));
  }
}
```

## HttpErrorResponse — Key Properties

```typescript
// HttpErrorResponse properties:
// error.status       — HTTP status code (404, 401, 500, 0 for network error)
// error.message      — Angular's error message string
// error.error        — the response body (parsed JSON or raw string)
// error.statusText   — HTTP status text ('Not Found', 'Internal Server Error')
// error.url          — the URL that failed

// Network errors have status === 0 and error.error is an Error instance:
// if (error.status === 0) { /* no network — error.error is a ProgressEvent or Error */ }
```

## Error Interceptor — Global HTTP Error Handling

One interceptor to handle all HTTP errors consistently across the app:

```typescript
// import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { catchError, throwError } from 'rxjs';

// const errorInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);
//   const toastService = inject(ToastService); // your toast/notification service
//
//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         router.navigate(['/login']); // session expired
//       } else if (error.status === 500) {
//         toastService.error('Server error. Our team has been notified.');
//       } else if (error.status === 0) {
//         toastService.warning('You appear to be offline. Check your connection.');
//       }
//       return throwError(() => error); // re-throw for service-level catchError
//     })
//   );
// };
```

## ErrorHandler — Angular's Global Uncaught Error Handler

Catches JavaScript errors that escape all other error handling — unhandled promise rejections, errors in event listeners, errors in component lifecycle hooks:

```typescript
// import { ErrorHandler, Injectable, inject } from '@angular/core';

// @Injectable()
class GlobalErrorHandler /* implements ErrorHandler */ {
  handleError(error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));

    console.error("[GlobalErrorHandler]", err);
    // In production:
    // this.errorTrackingService.captureException(err);
    // this.toastService.error('Something went wrong. Please refresh the page.');
  }
}

// Register in app.config.ts:
// export const appConfig: ApplicationConfig = {
//   providers: [
//     { provide: ErrorHandler, useClass: GlobalErrorHandler },
//     // ... other providers
//   ]
// };
```

## retry and retryWhen — Automatic Retry for Network Errors

```typescript
// import { retry, timer } from 'rxjs';

// retry(3) — retry up to 3 times immediately on error
// this.http.get('/api/data').pipe(
//   retry(3)
// )

// retry({ count: 3, delay: 1000 }) — retry 3 times with 1s delay between attempts
// this.http.get('/api/data').pipe(
//   retry({ count: 3, delay: 1000 })
// )

// Retry only on network errors (status === 0), not on 4xx/5xx:
// this.http.get('/api/data').pipe(
//   retry({
//     count: 3,
//     delay: (error: HttpErrorResponse) => {
//       if (error.status === 0) return timer(1000); // retry network errors
//       throw error; // don't retry HTTP errors
//     }
//   })
// )
```

## User-Facing Error Patterns

```typescript
// 1. Inline field errors — validation errors on specific form fields
// <mat-error *ngIf="emailControl.hasError('email')">Invalid email format</mat-error>

// 2. Toast notifications — transient messages for operation results
// this.toastService.error('Failed to save. Please try again.');

// 3. Error page — for catastrophic failures (404, 500 pages)
// router.navigate(['/error'], { state: { code: 404, message: 'Page not found' } })

// 4. Retry button — let the user retry a failed load
// <button *ngIf="loadError" (click)="loadData()">Retry</button>

// 5. Inline error state — replace content area with error + retry
// <div *ngIf="error" class="error-state">
//   <p>{{ error }}</p>
//   <button (click)="reload()">Try again</button>
// </div>
```

## EMPTY — Swallow an Error Gracefully

```typescript
// import { EMPTY } from 'rxjs';
// import { catchError } from 'rxjs/operators';

// EMPTY completes immediately without emitting. Use to stop the stream on error.
// this.http.get('/api/optional-data').pipe(
//   catchError(err => {
//     this.errorTracker.log(err); // ALWAYS log before swallowing
//     return EMPTY;               // stream completes — no error, no data
//   })
// )
```

## Common Mistake

Swallowing errors with `catchError(() => EMPTY)` without logging — bugs disappear silently and become impossible to debug.

```typescript
// BEFORE (dangerous — errors vanish):
// this.http.get('/api/data').pipe(
//   catchError(() => EMPTY) // What went wrong? Nobody knows.
// )

// AFTER (safe — errors are visible but handled gracefully):
// this.http.get('/api/data').pipe(
//   catchError(err => {
//     console.error('[DataService] Failed to load:', err); // at minimum, log it
//     // Better: this.errorTracker.captureException(err);
//     return EMPTY;
//   })
// )
```

Always log (to console, to Sentry, to your error tracker) before returning `EMPTY` or a fallback value. Silent failures are the hardest bugs to diagnose.

## When to Reach For This

- Any service that makes HTTP calls — always handle errors at the service layer
- Apps where multiple services/components need consistent error behavior (interceptor pays off with 3+ services)
- When you need to redirect on auth errors (401) or show a global offline banner (status 0)
- Production apps where you need error tracking and alerting (Sentry, Datadog, etc.)
- Any operation where retry improves reliability (flaky network, rate-limited APIs)
