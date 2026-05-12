// STANDALONE COMPONENTS — Solution

import {
  Component,
  NgModule,
  ApplicationConfig,
  provideZoneChangeDetection,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes, provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { bootstrapApplication } from "@angular/platform-browser";

// ============================================================
// Task 1: UserCardComponent — standalone: true + own imports
// ============================================================

@Component({
  selector: "app-user-card",
  standalone: true, // self-contained — no NgModule needed
  imports: [CommonModule], // each standalone component declares its own dependencies
  template: `
    <div class="card">
      <p>{{ user }}</p>
      <span *ngIf="user">Active user</span>
    </div>
  `,
  styles: [
    `
      .card {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    `,
  ],
})
export class UserCardComponent {
  user = "Alice";
}

// ============================================================
// Task 2: UserModule — standalone components are NOT declared
// Standalone components go in imports[], not declarations[]
// ============================================================

// Option A: Keep the module but import the standalone component
@NgModule({
  imports: [UserCardComponent], // standalone components go here
  exports: [UserCardComponent], // still exportable for NgModule consumers
})
export class UserModule {}

// Option B (preferred for new apps): delete UserModule entirely —
// standalone components are imported directly wherever they're needed.

// ============================================================
// Task 3: AppComponent — standalone, imports UserCardComponent
// ============================================================

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    UserCardComponent, // imported directly — no module intermediary
    RouterModule, // for routerLink, router-outlet
  ],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/admin">Admin</a>
    </nav>
    <router-outlet />
    <app-user-card />
  `,
})
export class AppComponent {}

// ============================================================
// Task 4: app.config.ts — providers without AppModule
// ============================================================

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone-based change detection (default) — or use provideExperimentalZonelessChangeDetection
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Router with the routes array
    provideRouter(routes),
    // HttpClient without needing HttpClientModule
    provideHttpClient(),
  ],
};

// ============================================================
// Task 5: main.ts — bootstrapApplication replaces bootstrapModule
// ============================================================

// In a real main.ts this would be:
// bootstrapApplication(AppComponent, appConfig).catch(console.error);

// ============================================================
// Task 6 (BONUS): lazy loading with loadComponent
// ============================================================

// admin.component.ts (in a real project this lives in its own file)
@Component({
  selector: "app-admin",
  standalone: true,
  template: `<h1>Admin Panel</h1>`,
})
export class AdminComponent {}

export const routes: Routes = [
  { path: "", component: AppComponent },
  {
    path: "admin",
    // loadComponent: Angular downloads the AdminComponent chunk only when the user navigates here
    // No NgModule wrapper needed — the standalone component IS the lazy boundary
    loadComponent: () =>
      // In a real project: import('./admin/admin.component').then(m => m.AdminComponent)
      Promise.resolve(AdminComponent),
  },
  { path: "**", redirectTo: "" },
];
