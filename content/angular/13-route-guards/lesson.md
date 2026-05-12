---
title: "Route Guards"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```typescript
// Without guards, any user can navigate to any URL directly
// http://localhost:4200/admin — no check, page loads even for anonymous users
// http://localhost:4200/users/123/edit — non-owners can see edit forms
// The component can check, but by then HTML is already rendered and flashing
```

Route guards let you intercept navigation before the component renders — redirect unauthenticated users, check permissions, prefetch data, or warn about unsaved changes.

## Mental Model

Think of route guards as security checkpoints at the entrance to a building. Before you get to the elevator (component), a guard checks your badge (token) and either waves you through or sends you to the front desk (login page). The guard decision happens before you enter, not after you're already inside.

## Functional Guards (Angular 14+)

Angular 14+ replaced class-based guards with simple functions. A guard returns `true` (allow), `false` (block), or a `UrlTree` (redirect):

```typescript
// auth.guard.ts
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService); // inject() works inside guard functions
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true; // allow navigation
  }

  // Redirect to login, preserving the attempted URL for redirect after login
  return router.createUrlTree(["/login"], {
    queryParams: { returnUrl: state.url },
  });
};
```

Attach the guard to a route with `canActivate`:

```typescript
// app.routes.ts
import { Routes } from "@angular/router";
import { authGuard } from "./auth.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [authGuard], // array — multiple guards run in order
  },
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [authGuard, adminGuard], // both must return true
  },
];
```

## Role-Based Guard

```typescript
// roles.guard.ts
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export function rolesGuard(requiredRoles: string[]): CanActivateFn {
  // Factory function — returns a guard configured with specific roles
  return (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(["/login"]);
    }

    const hasRole = requiredRoles.some((r) => auth.hasRole(r));
    if (!hasRole) {
      return router.createUrlTree(["/forbidden"]);
    }

    return true;
  };
}

// Usage in routes:
// { path: 'admin', canActivate: [rolesGuard(['ADMIN', 'SUPER_ADMIN'])] }
```

## canDeactivate — Warn on Unsaved Changes

```typescript
// unsaved-changes.guard.ts
import { CanDeactivateFn } from "@angular/router";

// T is the component type that will be guarded
export interface CanComponentDeactivate {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component,
) => {
  if (component.hasUnsavedChanges()) {
    return window.confirm("You have unsaved changes. Leave anyway?");
  }
  return true;
};
```

```typescript
// Route config
{ path: 'edit/:id', component: EditFormComponent, canDeactivate: [unsavedChangesGuard] }
```

## resolve — Prefetch Data Before Navigation

```typescript
// user.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { UserService } from './user.service';

export const userResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService);
  return userService.getUser(+route.paramMap.get('id')!);
};

// Route config — data is available in ActivatedRoute.data
{ path: 'users/:id', component: UserDetailComponent, resolve: { user: userResolver } }
```

## Common Mistake

Returning `false` from a guard without redirecting — the user sees a blank screen with no indication of why navigation failed:

```typescript
// WRONG: user is blocked with no feedback
if (!auth.isLoggedIn()) return false;

// RIGHT: redirect to login so the user knows what to do
if (!auth.isLoggedIn()) return router.createUrlTree(["/login"]);
```

## When to Reach For This

- Protecting routes from unauthenticated access — `canActivate` with `authGuard`
- Role/permission checks before showing admin pages — `canActivate` with `rolesGuard`
- Warning users about unsaved form data before navigating away — `canDeactivate`
- Fetching data before the component renders (no loading flicker) — `resolve`
