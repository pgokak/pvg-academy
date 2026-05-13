---
title: "Authentication & JWT"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

You have 20 service methods that each make HTTP calls. Every single one manually reads the token from localStorage and adds the Authorization header:

```typescript
// UserService
// getUsers(): Observable<User[]> {
//   const token = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };
//   return this.http.get<User[]>('/api/users', { headers });
// }

// ProductService — copy-pasted from UserService
// getProducts(): Observable<Product[]> {
//   const token = localStorage.getItem('token');                     // duplicated
//   const headers = { Authorization: `Bearer ${token}` };           // duplicated
//   return this.http.get<Product[]>('/api/products', { headers });  // 20 of these
// }
```

20 places to update when the token storage strategy changes. 20 places to forget if you add a new service. No central place to handle 401 responses.

## Mental Model

An auth service is a key card office. You check in once (login), get a key card (JWT), and the interceptor swipes it automatically on every door (HTTP request). You never carry the card manually.

The route guard is the security checkpoint at the building entrance — it checks your card before letting you into restricted areas.

## AuthService — The Key Card Office

```typescript
// import { Injectable, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { Observable, tap } from 'rxjs';

// @Injectable({ providedIn: 'root' })
class AuthService {
  // private http = inject(HttpClient);
  // private router = inject(Router);

  private readonly TOKEN_KEY = "auth_token";

  login(email: string, password: string): void {
    // In real code: this.http.post<{ token: string }>('/api/login', { email, password })
    //   .pipe(tap(res => this.storeToken(res.token)))
    //   .subscribe(() => this.router.navigate(['/dashboard']));

    // Simulate for demo:
    const mockToken =
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock";
    this.storeToken(mockToken);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      // JWT payload is base64-encoded in the second segment
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiry = payload.exp as number; // Unix timestamp in seconds
      return Date.now() / 1000 > expiry;
    } catch {
      return true; // treat malformed token as expired
    }
  }
}
```

## Token Storage: localStorage vs httpOnly Cookie

|                | localStorage                        | httpOnly Cookie                                    |
| -------------- | ----------------------------------- | -------------------------------------------------- |
| **XSS risk**   | Token accessible to JS (vulnerable) | Not accessible to JS (safe)                        |
| **CSRF risk**  | Not sent automatically (safe)       | Sent automatically (vulnerable without CSRF token) |
| **Complexity** | Simple                              | Requires server cooperation                        |
| **Best for**   | Internal tools, short-lived tokens  | Production user-facing apps                        |

For SPAs with a separate API: `localStorage` with **short expiry (15 min)** + **refresh tokens** (stored in httpOnly cookie) is a common pragmatic choice.

## AuthInterceptor — Automatic Header Injection

The interceptor runs before every outgoing HTTP request. You configure it once; all 20 services get the header for free.

```typescript
// import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { catchError, throwError } from 'rxjs';

// Functional interceptor (Angular 15+ preferred syntax):
// const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//   const token = authService.getToken();
//
//   // Requests are immutable — must clone before modifying
//   const authReq = token
//     ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
//     : req;
//
//   return next(authReq).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         authService.logout();
//         router.navigate(['/login']);
//       }
//       return throwError(() => error);
//     })
//   );
// };
```

## Registering the Interceptor

```typescript
// In app.config.ts (standalone app):
// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideHttpClient(
//       withInterceptors([authInterceptor])  // register here once
//     ),
//     provideRouter(routes)
//   ]
// };
```

## Route Guard Using AuthService

```typescript
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { CanActivateFn } from '@angular/router';

// Functional guard (Angular 14+):
// const authGuard: CanActivateFn = () => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//
//   if (authService.isLoggedIn()) {
//     return true;
//   }
//   return router.createUrlTree(['/login']);
// };

// Attach to protected routes:
// const routes: Routes = [
//   { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
//   { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
//   { path: 'login', component: LoginComponent }
// ];
```

## Token Refresh Pattern

```typescript
// Advanced: intercept 401, refresh the token, retry the original request
// const authInterceptorWithRefresh: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService);
//
//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401 && !req.url.includes('/auth/refresh')) {
//         return authService.refreshToken().pipe(
//           switchMap(newToken => {
//             authService.storeToken(newToken);
//             const retried = req.clone({
//               setHeaders: { Authorization: `Bearer ${newToken}` }
//             });
//             return next(retried); // retry with new token
//           }),
//           catchError(() => {
//             authService.logout();
//             return throwError(() => error);
//           })
//         );
//       }
//       return throwError(() => error);
//     })
//   );
// };
```

## Common Mistake

Storing the raw JWT in a global variable or on the `window` object — any library, script, or XSS payload can read or overwrite it.

```typescript
// BAD: raw global — any code in the app can read or tamper with this
// (window as any).authToken = token;

// BAD: module-level variable — no encapsulation, no way to swap storage strategy
// let currentToken: string | null = null;

// GOOD: encapsulated in a service — storage strategy is an implementation detail.
// Want to switch to sessionStorage? Change one line in AuthService.
// Want to add encryption? One place to update.
// class AuthService {
//   private getToken(): string | null {
//     return localStorage.getItem('auth_token'); // only AuthService knows this detail
//   }
// }
```

## When to Reach For This

- Any app where users log in — web apps, admin panels, customer portals
- When multiple services need to send authenticated requests (the interceptor pays for itself immediately)
- When you need to redirect unauthenticated users away from protected routes
- When tokens expire and need refresh without interrupting the user experience
- When you need to handle different auth errors (401 vs 403) consistently across the app
