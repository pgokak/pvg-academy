// MODULES & CONFIGURATION — Solution

import { NgModule, Component, Injectable } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
import { Observable, of } from "rxjs";

// ─── Components ───────────────────────────────────────────────────────────────
export class UserListComponent {
  users: unknown[] = [];
}

export class UserCardComponent {
  user: unknown = null;
}

export class UserFormComponent {
  // Uses ReactiveFormsModule internally via the module's imports
}

// ─── Service ─────────────────────────────────────────────────────────────────
// Note: no providedIn: 'root' — this service is scoped to UserModule
// (or whichever module provides it in its providers array)
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<unknown[]> {
    return this.http.get<unknown[]>("/api/users");
  }
}

// ─── Complete NgModule ────────────────────────────────────────────────────────
@NgModule({
  declarations: [
    // Everything this module OWNS
    UserListComponent,
    UserCardComponent,
    UserFormComponent,
  ],
  imports: [
    // External modules this module NEEDS
    CommonModule, // *ngFor, *ngIf, pipes
    HttpClientModule, // Provides HttpClient for UserService
    ReactiveFormsModule, // Provides FormBuilder, FormGroup for UserFormComponent
  ],
  exports: [
    // What we share with the world — other modules that import UserModule
    // get access to these two components in their templates
    UserListComponent,
    UserCardComponent,
    // UserFormComponent is intentionally NOT exported — it's an internal detail
  ],
  providers: [
    // Module-scoped service — a new instance for each module that imports UserModule
    // Use this instead of providedIn: 'root' when you want isolated instances
    UserService,
  ],
})
export class UserModule {}

// ─── BONUS: Standalone Component ─────────────────────────────────────────────
// Standalone components manage their own imports — no NgModule declaration needed
@Component({
  selector: "app-standalone-user-card",
  standalone: true,
  imports: [
    CommonModule, // Needed for @if / *ngIf
  ],
  template: `
    <div class="user-card" *ngIf="user">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
    </div>
    <p *ngIf="!user">No user selected</p>
  `,
})
export class StandaloneUserCardComponent {
  user: { name: string; email: string } | null = null;
}

// ─── app.config.ts equivalent (application bootstrap) ────────────────────────
// In a fully standalone app, you'd configure providers like this:
//
// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes),
//     provideHttpClient(),
//     provideAnimations()
//   ]
// };
//
// This replaces AppModule entirely.
