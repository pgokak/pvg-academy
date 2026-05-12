// ROUTING & NAVIGATION — Starter Exercise
//
// TASK: Configure routing for a simple app with Home, Users list, User detail, and 404.
//
// YOUR TASKS:
// 1. Complete the routes array:
//    - '' → HomeComponent
//    - 'users' → UserListComponent
//    - 'users/:id' → UserDetailComponent
//    - 'about' → lazy load AboutComponent from './about/about.component'
//    - '**' → NotFoundComponent (must be last)
//
// 2. In UserDetailComponent:
//    - Inject ActivatedRoute
//    - Read the :id param in ngOnInit
//    - Display it in the template
//
// 3. In UserListComponent:
//    - Inject Router
//    - Add a method navigateToUser(id: number) that calls router.navigate()
//
// 4. In AppComponent: add the router-outlet and navigation links

import { Routes } from "@angular/router";
import { Component, OnInit, inject } from "@angular/core";
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  ActivatedRoute,
  Router,
} from "@angular/router";
import { CommonModule } from "@angular/common";

// ─── Stub components ──────────────────────────────────────────────────────────
@Component({
  selector: "app-home",
  standalone: true,
  template: `<h1>Home Page</h1>`,
})
export class HomeComponent {}

@Component({
  selector: "app-not-found",
  standalone: true,
  template: `<h1>404 — Not Found</h1>`,
})
export class NotFoundComponent {}

// ─── Task 2: UserDetailComponent ─────────────────────────────────────────────
@Component({
  selector: "app-user-detail",
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- TODO: Display the user ID from the route param -->
    <h2>User Detail</h2>
    <!-- <p>User ID: {{ userId }}</p> -->
  `,
})
export class UserDetailComponent implements OnInit {
  userId: number | null = null;

  ngOnInit(): void {
    // TODO: inject ActivatedRoute and read 'id' param
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
      <li *ngFor="let user of users">
        <!-- TODO: Add routerLink to navigate to /users/:id -->
        <a>{{ user.name }}</a>
        <!-- TODO: Also add a button that calls navigateToUser(user.id) -->
      </li>
    </ul>
  `,
})
export class UserListComponent {
  users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];

  navigateToUser(id: number): void {
    // TODO: inject Router and navigate to /users/:id
  }
}

// ─── Task 1: Routes ───────────────────────────────────────────────────────────
export const routes: Routes = [
  // TODO: Add all 5 routes described above
];

// ─── Task 4: AppComponent ─────────────────────────────────────────────────────
@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: ` <!-- TODO: Add navigation links and router-outlet --> `,
})
export class AppComponent {}
