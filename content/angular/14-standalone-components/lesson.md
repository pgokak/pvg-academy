---
title: "Standalone Components"
version: "Angular 17+"
since: 2022
stable: true
---

## The Problem

```typescript
// NgModule-based apps require every component to be declared in exactly one module
// Adding a new component means touching at least two files

// shared.module.ts
@NgModule({
  declarations: [ButtonComponent, CardComponent, AvatarComponent],
  exports: [ButtonComponent, CardComponent, AvatarComponent],
  imports: [CommonModule],
})
export class SharedModule {}

// feature.module.ts — must import SharedModule just to use ButtonComponent
@NgModule({
  declarations: [FeatureComponent],
  imports: [CommonModule, SharedModule, RouterModule],
})
export class FeatureModule {}
```

Every new component requires a module declaration, an export, and an import elsewhere. Tracing where a component comes from means hunting through multiple module files.

## Mental Model

Standalone components are self-contained. Instead of a shared shopping cart (NgModule) distributing items, each component carries its own shopping list — it declares directly which other components, pipes, and directives it needs. Dependencies are explicit at the component level, not hidden inside a module somewhere.

## standalone: true

```typescript
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ButtonComponent } from "../button/button.component";

@Component({
  selector: "app-feature",
  standalone: true,
  // Import exactly what this component uses — no module intermediary
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <app-button (click)="doSomething()">Click me</app-button>
    <a routerLink="/home">Home</a>
    <p *ngIf="show">Visible</p>
  `,
})
export class FeatureComponent {
  show = true;
  doSomething(): void {}
}
```

Rules:

- A standalone component is **not** declared in any `@NgModule`
- It lists its own `imports` — other standalone components, directives, pipes, or modules
- It can be imported directly by other standalone components

## bootstrapApplication — The NgModule-free Entry Point

```typescript
// main.ts — replaces platformBrowserDynamic().bootstrapModule(AppModule)
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

bootstrapApplication(AppComponent, appConfig);
```

```typescript
// app.config.ts — replaces AppModule providers
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Add more providers here
  ],
};
```

## Lazy Loading Standalone Components

```typescript
// app.routes.ts — loadComponent instead of loadChildren
import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "dashboard",
    // Lazy-loads a single standalone component — no module wrapper needed
    loadComponent: () =>
      import("./dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "admin",
    // Lazy-load a group of routes from a separate file
    loadChildren: () =>
      import("./admin/admin.routes").then((m) => m.adminRoutes),
  },
];
```

## Converting from NgModule to Standalone

```typescript
// BEFORE (NgModule-based)
@NgModule({
  declarations: [UserCardComponent],
  imports: [CommonModule],
  exports: [UserCardComponent],
})
export class UserCardModule {}

// AFTER (standalone)
@Component({
  selector: "app-user-card",
  standalone: true,
  imports: [CommonModule], // moved here from the module
  template: `...`,
})
export class UserCardComponent {
  // Remove from the NgModule declarations — standalone components are self-declaring
}
```

## Common Mistake

Adding a standalone component to an NgModule's `declarations` array — standalone components must not be declared in a module:

```typescript
// WRONG: NG0305 — standalone component cannot be in declarations
@NgModule({
  declarations: [StandaloneComponent], // error
})
export class AppModule {}

// RIGHT: import it instead
@NgModule({
  imports: [StandaloneComponent], // standalone components go in imports
})
export class AppModule {}
```

## When to Reach For This

- All new Angular 17+ projects — standalone by default
- Migrating piece by piece from NgModule — convert leaf components first
- Lazy loading individual components without a module wrapper — `loadComponent`
- Building a library where consumers import individual components — standalone is tree-shakeable and explicit
