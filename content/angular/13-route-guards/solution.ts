// ROUTE GUARDS — Solution

import { inject } from "@angular/core";
import {
  CanActivateFn,
  CanDeactivateFn,
  Router,
  Routes,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { Component } from "@angular/core";

// --- Stub service ---
@Injectable({ providedIn: "root" })
export class AuthService {
  private loggedIn = false;
  private roles: string[] = [];

  login(roles: string[]): void {
    this.loggedIn = true;
    this.roles = roles;
  }

  logout(): void {
    this.loggedIn = false;
    this.roles = [];
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }
}

// --- Stub components ---
@Component({
  selector: "app-login",
  standalone: true,
  template: "<h1>Login</h1>",
})
export class LoginComponent {}

@Component({
  selector: "app-dashboard",
  standalone: true,
  template: "<h1>Dashboard</h1>",
})
export class DashboardComponent {}

@Component({
  selector: "app-admin",
  standalone: true,
  template: "<h1>Admin</h1>",
})
export class AdminComponent {}

@Component({
  selector: "app-forbidden",
  standalone: true,
  template: "<h1>403 Forbidden</h1>",
})
export class ForbiddenComponent {}

// --- Guard 1: authGuard ---
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService); // inject() resolves from the current injection context
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  // Preserve the attempted URL in a query param so we can redirect after login
  return router.createUrlTree(["/login"], {
    queryParams: { returnUrl: state.url },
  });
};

// --- Guard 2: adminGuard ---
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(["/login"], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (!auth.hasRole("ADMIN")) {
    // User is authenticated but lacks the required role
    return router.createUrlTree(["/forbidden"]);
  }

  return true;
};

// --- Guard 3: routes config ---
export const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [authGuard], // must be logged in
  },
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [authGuard, adminGuard], // must be logged in AND have ADMIN role
  },
  { path: "forbidden", component: ForbiddenComponent },
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
];

// --- BONUS: canDeactivate guard ---

// Define a contract — any component that wants this guard must implement it
export interface CanComponentDeactivate {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component,
) => {
  if (component.hasUnsavedChanges()) {
    // Returning false blocks navigation; window.confirm returns true/false
    return window.confirm("You have unsaved changes. Leave this page?");
  }
  // No unsaved changes — allow navigation immediately
  return true;
};

// Example component using the guard:
@Component({
  selector: "app-edit-form",
  standalone: true,
  template: `
    <form>
      <input [(ngModel)]="value" name="value" />
      <button type="submit">Save</button>
    </form>
  `,
})
export class EditFormComponent implements CanComponentDeactivate {
  value = "";
  private savedValue = "";

  hasUnsavedChanges(): boolean {
    // Returns true if the user has typed something not yet saved
    return this.value !== this.savedValue;
  }

  save(): void {
    this.savedValue = this.value;
  }
}
