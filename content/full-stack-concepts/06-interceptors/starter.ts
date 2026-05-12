// INTERCEPTORS & FILTERS — Starter Exercise
//
// TASK: Implement two Angular HTTP interceptors.
//
// YOUR TASKS:
// 1. Implement authInterceptor:
//    - Read token from localStorage (key: 'auth_token')
//    - If token exists, clone the request and add Authorization: Bearer <token> header
//    - If no token, pass request through unchanged
//    - If response is 401, clear localStorage and redirect to /login
//      (hint: inject Router, return throwError after clearing)
//
// 2. Implement loggingInterceptor:
//    - Log the request: "→ METHOD URL" before the request goes out
//    - Log the response: "← STATUS_CODE URL (Xms)" when response arrives
//    - Log errors: "✗ METHOD URL error: MESSAGE" on failure
//    - Use Date.now() to measure duration
//
// 3. Show how to register both interceptors in app.config.ts

// Assume these imports are available:
// import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { tap, catchError } from 'rxjs/operators';
// import { throwError } from 'rxjs';

// ─── Task 1: Auth Interceptor ─────────────────────────────────────────────────
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: implement
  // Step 1: get token from localStorage
  // Step 2: if token, clone req with Authorization header
  // Step 3: pass through
  // Step 4: pipe the result — if 401 error, clear storage + redirect to /login
  return next(req); // placeholder
};

// ─── Task 2: Logging Interceptor ─────────────────────────────────────────────
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: implement
  // Step 1: record start time and log the outgoing request
  // Step 2: return next(req) piped with tap() for responses and catchError() for errors
  return next(req); // placeholder
};

// ─── Task 3: Registration ─────────────────────────────────────────────────────
// TODO: Show the app.config.ts providers array that registers both interceptors
// The order matters: logging runs first (outermost), then auth adds the header
//
// export const appConfig = {
//   providers: [
//     ???
//   ]
// };
