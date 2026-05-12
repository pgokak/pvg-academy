// ROUTE GUARDS — Starter Exercise
//
// TASK: Implement two functional route guards for a dashboard app.
//
// YOUR TASKS:
// 1. Complete authGuard: use inject() to get AuthService and Router.
//    - If auth.isLoggedIn() → return true
//    - Otherwise → redirect to /login with returnUrl query param
// 2. Complete adminGuard: only allow users with the 'ADMIN' role.
//    - Not logged in → redirect to /login
//    - Logged in but no ADMIN role → redirect to /forbidden
//    - Has ADMIN → return true
// 3. Wire up the routes: apply authGuard to /dashboard, both guards to /admin
// 4. BONUS: Implement unsavedChangesGuard (canDeactivate)

// Assume these imports are available:
// import { inject } from '@angular/core';
// import { CanActivateFn, CanDeactivateFn, Router, Routes } from '@angular/router';

// --- Stub services (already implemented elsewhere) ---
declare class AuthService {
  isLoggedIn(): boolean;
  hasRole(role: string): boolean;
}

// --- Exercise 1: authGuard ---
// export const authGuard: CanActivateFn = (route, state) => {
//   TODO: inject AuthService and Router
//   TODO: check isLoggedIn
//   TODO: redirect to /login with returnUrl on failure
// };

// --- Exercise 2: adminGuard ---
// export const adminGuard: CanActivateFn = (route, state) => {
//   TODO: inject AuthService and Router
//   TODO: if not logged in → /login
//   TODO: if logged in but not ADMIN → /forbidden
//   TODO: return true
// };

// --- Exercise 3: wire up routes ---
// export const routes: Routes = [
//   { path: 'login', ... },
//   { path: 'dashboard', ..., canActivate: [TODO] },
//   { path: 'admin', ..., canActivate: [TODO] },
//   { path: 'forbidden', ... },
// ];

// --- Exercise 4 (BONUS): unsavedChangesGuard ---
// export interface CanComponentDeactivate {
//   hasUnsavedChanges(): boolean;
// }
// export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
//   TODO: if component.hasUnsavedChanges() ask for confirmation
//   TODO: otherwise return true
// };
