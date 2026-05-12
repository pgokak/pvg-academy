// ROUTING & NAVIGATION — Solution

import { Routes, provideRouter } from "@angular/router";
import { Component, OnInit, inject } from "@angular/core";
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  ActivatedRoute,
  Router,
} from "@angular/router";
import { CommonModule } from "@angular/common";
import { ApplicationConfig } from "@angular/core";

// ─── Stub components ──────────────────────────────────────────────────────────
@Component({
  selector: "app-home",
  standalone: true,
  template: `
    <h1>Home Page</h1>
    <p>Welcome to the app!</p>
  `,
})
export class HomeComponent {}

@Component({
  selector: "app-not-found",
  standalone: true,
  template: `
    <h1>404 — Page Not Found</h1>
    <a routerLink="/">Back to Home</a>
  `,
  imports: [RouterLink],
})
export class NotFoundComponent {}

// ─── Task 2: UserDetailComponent ─────────────────────────────────────────────
@Component({
  selector: "app-user-detail",
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>User Detail</h2>
    @if (userId) {
      <p>
        Loading details for user ID: <strong>{{ userId }}</strong>
      </p>
    }
    <a routerLink="/users">← Back to Users</a>
  `,
  // RouterLink must be imported for the back link
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  userId: number | null = null;

  ngOnInit(): void {
    // snapshot.paramMap.get() reads the current value once
    const idStr = this.route.snapshot.paramMap.get("id");
    this.userId = idStr ? Number(idStr) : null;

    // For components that stay alive when navigating to different IDs:
    // this.route.paramMap.subscribe(params => {
    //   this.userId = Number(params.get('id'));
    // });
  }
}

// ─── Task 3: UserListComponent ────────────────────────────────────────────────
@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h2>Users</h2>
    <ul>
      @for (user of users; track user.id) {
        <li>
          <!-- routerLink with array syntax: navigates to /users/1, /users/2, etc. -->
          <a [routerLink]="['/users', user.id]">{{ user.name }}</a>
          <button (click)="navigateToUser(user.id)">View</button>
        </li>
      }
    </ul>
  `,
})
export class UserListComponent {
  private router = inject(Router);

  users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];

  navigateToUser(id: number): void {
    this.router.navigate(["/users", id]);
    // Equivalent to: router.navigateByUrl(`/users/${id}`)
  }
}

// ─── Task 1: Routes ───────────────────────────────────────────────────────────
export const routes: Routes = [
  // Angular matches routes in ORDER — more specific routes before wildcards
  { path: "", component: HomeComponent },
  { path: "users", component: UserListComponent },
  { path: "users/:id", component: UserDetailComponent },

  // Lazy loading — only downloads AboutComponent's chunk when first visited
  {
    path: "about",
    loadComponent: () =>
      import("./about/about.component").then((m) => m.AboutComponent),
  },

  // Wildcard MUST be last — matches anything not caught above
  { path: "**", component: NotFoundComponent },
];

// ─── Task 4: AppComponent ─────────────────────────────────────────────────────
@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav>
      <!-- routerLinkActive adds 'active' class when the route matches -->
      <a
        routerLink="/"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        >Home</a
      >
      <a routerLink="/users" routerLinkActive="active">Users</a>
      <a routerLink="/about" routerLinkActive="active">About</a>
    </nav>

    <!-- Angular renders the matched component here -->
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      nav {
        background: #333;
        padding: 12px;
        display: flex;
        gap: 16px;
      }
      nav a {
        color: white;
        text-decoration: none;
      }
      nav a.active {
        color: #ffd740;
      }
      main {
        padding: 16px;
      }
    `,
  ],
})
export class AppComponent {}

// ─── app.config.ts ────────────────────────────────────────────────────────────
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
