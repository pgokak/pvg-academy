---
title: "Routing & Navigation"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```typescript
// Manual show/hide based on URL — broken history, no deep links
@Component({
  template: `
    <app-home *ngIf="currentPage === 'home'"></app-home>
    <app-users *ngIf="currentPage === 'users'"></app-users>
    <app-detail *ngIf="currentPage === 'detail'"></app-detail>
  `,
})
export class AppComponent {
  currentPage = "home";
  // Refresh the page → always lands on 'home', URL state is lost
  // Share a URL → gets the homepage, not the intended page
  // Back button → doesn't work — no browser history entries
}
```

## Mental Model

The router is a switchboard. It maps URL patterns to components — Angular swaps the right component into `<router-outlet>` automatically. The URL becomes the source of truth for which view is active, enabling browser history, deep links, and sharing.

## Route Configuration

```typescript
// app.routes.ts
export const routes: Routes = [
  // Exact match
  { path: "", component: HomeComponent },

  // List page
  { path: "users", component: UserListComponent },

  // Detail page with dynamic segment
  { path: "users/:id", component: UserDetailComponent },

  // Nested routes
  {
    path: "admin",
    component: AdminLayoutComponent,
    children: [
      { path: "dashboard", component: AdminDashboardComponent },
      { path: "users", component: AdminUserListComponent },
    ],
  },

  // Lazy loading — only download the code when this route is first visited
  {
    path: "reports",
    loadComponent: () =>
      import("./reports/reports.component").then((m) => m.ReportsComponent),
  },

  // Redirect
  { path: "home", redirectTo: "", pathMatch: "full" },

  // Wildcard — must be last
  { path: "**", component: NotFoundComponent },
];

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()],
};
```

## Template Navigation

```html
<!-- routerLink navigates without a full page reload -->
<nav>
  <a routerLink="/">Home</a>
  <a routerLink="/users">Users</a>
  <a [routerLink]="['/users', user.id]">{{ user.name }}</a>
</nav>

<!-- routerLinkActive adds a class when the route is active -->
<a routerLink="/users" routerLinkActive="active-link">Users</a>

<!-- router-outlet is where matched components are rendered -->
<router-outlet></router-outlet>
```

## Reading Route Parameters

```typescript
@Component({ selector: "app-user-detail" })
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  user: User | null = null;

  ngOnInit(): void {
    // Read the :id from the URL
    const id = Number(this.route.snapshot.paramMap.get("id"));
    this.userService.getUserById(id).subscribe((user) => (this.user = user));

    // OR subscribe to params for when the ID can change without navigation
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get("id"));
      this.loadUser(id);
    });
  }
}
```

## Programmatic Navigation

```typescript
@Component({ ... })
export class LoginComponent {
  private router = inject(Router);

  onLoginSuccess(userId: number): void {
    // Navigate with path segments
    this.router.navigate(['/users', userId]);

    // Navigate relative to current route
    this.router.navigate(['../dashboard'], { relativeTo: this.route });

    // Navigate with query params: /search?q=angular&page=1
    this.router.navigate(['/search'], { queryParams: { q: 'angular', page: 1 } });
  }
}
```

## Common Mistake

Forgetting the wildcard route or putting it before more specific routes — Angular matches routes in order:

```typescript
// WRONG — wildcard before specific routes
const routes: Routes = [
  { path: "**", component: NotFoundComponent }, // This matches EVERYTHING
  { path: "users", component: UserListComponent }, // Never reached!
];

// RIGHT — wildcard last
const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "users", component: UserListComponent },
  { path: "**", component: NotFoundComponent }, // Catches unmatched routes
];
```

## When to Reach For This

- Any multi-page application — even simple apps benefit from URL-based navigation
- Protecting pages from unauthorized access — route guards (`canActivate`)
- Prefetching data before a component renders — resolve guards
- Reducing initial bundle size — lazy loading with `loadComponent`
- Navigating after a form submit or API call — `router.navigate()`
