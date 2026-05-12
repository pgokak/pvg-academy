// INTERCEPTORS & FILTERS — Solution

import {
  HttpInterceptorFn,
  HttpResponse,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { tap, catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";

// ─── Task 1: Auth Interceptor ─────────────────────────────────────────────────
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem("auth_token");

  // If no token, pass the request through unchanged
  // (the server will return 401 and we'll handle it below)
  if (!token) {
    return next(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          localStorage.removeItem("auth_token");
          router.navigate(["/login"]);
        }
        return throwError(() => err);
      }),
    );
  }

  // Clone the request — HttpRequest objects are immutable
  // clone() creates a copy with merged changes
  const authReq = req.clone({
    headers: req.headers.set("Authorization", `Bearer ${token}`),
  });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Token expired or invalid — clear and redirect
        localStorage.removeItem("auth_token");
        router.navigate(["/login"]);
      }
      return throwError(() => err);
    }),
  );
};

// ─── Task 2: Logging Interceptor ─────────────────────────────────────────────
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const start = Date.now();
  console.log(`→ ${req.method} ${req.url}`);

  return next(req).pipe(
    tap((event) => {
      // tap lets us observe without modifying
      // HttpResponse is the final event when the full response body arrives
      if (event instanceof HttpResponse) {
        const duration = Date.now() - start;
        console.log(`← ${event.status} ${req.url} (${duration}ms)`);
      }
    }),
    catchError((err: HttpErrorResponse) => {
      const duration = Date.now() - start;
      console.error(
        `✗ ${req.method} ${req.url} (${duration}ms) error: ${err.message}`,
      );
      // Re-throw so downstream subscribers still get the error
      return throwError(() => err);
    }),
  );
};

// ─── Task 3: Registration in app.config.ts ────────────────────────────────────
// Order in the array = order of execution for outgoing requests
// loggingInterceptor runs first (outermost), then authInterceptor adds the header
// For responses, order is reversed: authInterceptor response, then loggingInterceptor
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]), // your routes here
    provideHttpClient(
      withInterceptors([
        loggingInterceptor, // First: log the request
        authInterceptor, // Second: add auth header
      ]),
    ),
  ],
};

// ─── Usage: no change needed in services ─────────────────────────────────────
// Services remain identical — no headers, no logging code
//
// @Injectable({ providedIn: 'root' })
// export class UserService {
//   getUsers(): Observable<User[]> {
//     return this.http.get<User[]>('/api/users');
//     // Token is automatically added by authInterceptor
//     // Request is automatically logged by loggingInterceptor
//   }
// }
