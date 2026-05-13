---
title: "Advanced Routing"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

Your app has an admin dashboard, a user profile section, a reports page, and a settings area. You ship them all in one bundle. A user visits the login page and waits 8 seconds while their browser parses JavaScript for the admin dashboard they may never open.

On the user detail page, Angular renders the component immediately — the template flashes with empty fields for half a second until the HTTP call resolves. The user sees `Name: ` with nothing next to it.

```typescript
// Every route in one bundle — everything loads upfront
// const routes: Routes = [
//   { path: 'admin', component: AdminDashboardComponent },
//   { path: 'users/:id', component: UserDetailComponent },
//   { path: 'reports', component: ReportsComponent },
// ];
// Result: one giant main.js that includes AdminDashboard even when
// the user is on the login page and has no admin access
```

## Mental Model

Lazy loading is a library that only stocks shelves when someone walks down that aisle. The other 10,000 books aren't in the building yet — they're ordered on demand.

A resolver is a maître d' who seats you only once your table is ready. You don't sit down and then wait — you wait at the door and only enter when the table (data) is set.

## Lazy Loading with loadComponent and loadChildren

**Standalone components (Angular 14+) — `loadComponent`:**

```typescript
// const routes: Routes = [
//   {
//     path: 'admin',
//     loadComponent: () =>
//       import('./admin/admin.component').then(m => m.AdminComponent)
//   },
//   {
//     path: 'reports',
//     loadComponent: () =>
//       import('./reports/reports.component').then(m => m.ReportsComponent)
//   }
// ];
// Each loadComponent creates a separate JS chunk — only fetched when the route is hit
```

**NgModule-based — `loadChildren`:**

```typescript
// const routes: Routes = [
//   {
//     path: 'admin',
//     loadChildren: () =>
//       import('./admin/admin.module').then(m => m.AdminModule)
//   }
// ];
```

The browser only downloads the chunk when the user navigates to that path. First load is dramatically faster.

## Preloading Strategies

After initial load, you may want to pre-fetch lazy chunks in the background so subsequent navigations feel instant:

```typescript
// import { RouterModule, PreloadAllModules, NoPreloading } from '@angular/router';

// provideRouter(routes, withPreloading(PreloadAllModules))
// → After app loads, Angular fetches ALL lazy chunks in the background

// provideRouter(routes, withPreloading(NoPreloading))
// → Default: nothing is preloaded; chunks load on-demand only

// Custom preload strategy (e.g., only preload routes marked with data.preload):
// class SelectivePreloadStrategy implements PreloadingStrategy {
//   preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
//     return route.data?.['preload'] ? load() : EMPTY;
//   }
// }
```

## Resolvers — Fetch Data Before the Route Activates

```typescript
// import { ResolveFn } from '@angular/router';
// import { inject } from '@angular/core';

// Functional resolver (Angular 14+):
// const userResolver: ResolveFn<User> = (route) => {
//   const userService = inject(UserService);
//   const id = route.paramMap.get('id')!;
//   return userService.getUser(id); // returns Observable<User>
// };

// Attach to the route:
// const routes: Routes = [
//   {
//     path: 'users/:id',
//     component: UserDetailComponent,
//     resolve: { user: userResolver }
//   }
// ];

// Consume in the component:
// class UserDetailComponent {
//   route = inject(ActivatedRoute);
//   user: User = this.route.snapshot.data['user'];
//   // Component renders AFTER the resolver completes — no empty flash
// }
```

## Nested Routes and Child Router Outlets

```typescript
// const routes: Routes = [
//   {
//     path: 'settings',
//     component: SettingsLayoutComponent,  // has its own <router-outlet>
//     children: [
//       { path: 'profile', component: ProfileSettingsComponent },
//       { path: 'security', component: SecuritySettingsComponent },
//       { path: '', redirectTo: 'profile', pathMatch: 'full' }
//     ]
//   }
// ];

// SettingsLayoutComponent template:
// <nav>
//   <a routerLink="profile">Profile</a>
//   <a routerLink="security">Security</a>
// </nav>
// <router-outlet></router-outlet>  <!-- children render here -->
```

## Route Data: Static Metadata

```typescript
// const routes: Routes = [
//   {
//     path: 'about',
//     component: AboutComponent,
//     data: { title: 'About Us', breadcrumb: 'About' }
//   }
// ];

// Read in component:
// class AboutComponent {
//   route = inject(ActivatedRoute);
//   title = this.route.snapshot.data['title']; // 'About Us'
// }
```

## ActivatedRoute: params vs snapshot

```typescript
// class UserDetailComponent implements OnInit {
//   route = inject(ActivatedRoute);
//   router = inject(Router);

//   // snapshot — read once on component init. Fine when component is
//   // always destroyed and recreated on navigation.
//   userId = this.route.snapshot.paramMap.get('id');

//   // Observable params — subscribe when the component STAYS ALIVE
//   // across navigations (e.g., /users/1 → /users/2 without destroying the component)
//   ngOnInit(): void {
//     this.route.params.subscribe(params => {
//       this.loadUser(params['id']); // reacts to every param change
//     });
//   }

//   // Router.navigate() — programmatic navigation (use from TypeScript logic)
//   goToUser(id: string): void {
//     this.router.navigate(['/users', id]);
//     // vs routerLink="/users/{{id}}" in template — prefer routerLink in templates
//   }
// }
```

## Common Mistake

Using `snapshot.params` for route parameters that can change while the component is still alive — the component won't react when the user navigates from `/users/1` to `/users/2` because the snapshot is captured once and never updates.

```typescript
// BEFORE (broken for same-component re-navigation):
// class UserDetailComponent {
//   userId = this.route.snapshot.paramMap.get('id'); // captured once, never updates
//   // User navigates /users/1 → /users/2 — component reuses, snapshot is stale
// }

// AFTER (reactive, always current):
// class UserDetailComponent implements OnInit {
//   ngOnInit(): void {
//     this.route.paramMap.subscribe(params => {
//       const id = params.get('id');
//       this.loadUser(id!); // runs every time the id param changes
//     });
//   }
// }
```

## When to Reach For This

- Any route that imports a heavy component or third-party library (charts, editors, PDF viewers)
- Admin or role-specific sections that most users never visit
- Routes that require data before rendering to avoid content flash
- Apps with complex layouts where sections share a parent shell (nested routes)
- When you need to navigate programmatically from TypeScript logic based on API responses
