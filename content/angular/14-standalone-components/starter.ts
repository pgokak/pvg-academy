// STANDALONE COMPONENTS — Starter Exercise
//
// TASK: Convert a NgModule-based app to standalone components.
//
// YOUR TASKS:
// 1. Add standalone: true to UserCardComponent and move CommonModule into its imports
// 2. Remove UserCardComponent from UserModule's declarations and add it to imports instead
//    (or delete UserModule entirely if nothing else uses it)
// 3. Update AppComponent: make it standalone, import UserCardComponent directly
// 4. Write an app.config.ts with provideRouter and provideHttpClient
// 5. Update main.ts to use bootstrapApplication(AppComponent, appConfig)
// 6. BONUS: add a lazy-loaded route for AdminComponent using loadComponent

// Assume these imports are available:
// import { Component, NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { BrowserModule } from '@angular/platform-browser';
// import { RouterModule, Routes } from '@angular/router';
// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient } from '@angular/common/http';
// import { bootstrapApplication } from '@angular/platform-browser';

// --- BEFORE: NgModule-based ---

// TODO: Task 1 — add standalone: true, move CommonModule to imports
// @Component({ selector: 'app-user-card', template: `<p>{{ user }}</p>` })
export class UserCardComponent {
  user = "Alice";
}

// TODO: Task 2 — update UserModule (or remove it)
// @NgModule({
//   declarations: [UserCardComponent], // <-- needs to change
//   imports: [CommonModule],
//   exports: [UserCardComponent],
// })
export class UserModule {}

// TODO: Task 3 — make AppComponent standalone and import UserCardComponent directly
// @Component({
//   selector: 'app-root',
//   template: `<app-user-card />`
//   // needs: standalone, imports: [UserCardComponent]
// })
export class AppComponent {}

// TODO: Task 4 — create app.config.ts content here
// export const appConfig: ApplicationConfig = { providers: [...] };

// TODO: Task 5 — bootstrapApplication call
// bootstrapApplication(AppComponent, appConfig);

// TODO: Task 6 (BONUS) — lazy-loaded route for AdminComponent
// export const routes: Routes = [
//   { path: '', component: AppComponent },
//   { path: 'admin', loadComponent: () => import(...).then(m => m.AdminComponent) },
// ];
