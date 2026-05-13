// Angular Advanced Routing — Starter Exercise
// Commented imports (would resolve in a real Angular project):
// import { Routes, ResolveFn, ActivatedRoute, Router } from '@angular/router';
// import { Component, OnInit, inject } from '@angular/core';
// import { Observable, of } from 'rxjs';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Simulated service (no DI needed for plain TS execution)
class UserService {
  getUser(id: string): User {
    return {
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
      role: "viewer",
    };
  }
}

// ─────────────────────────────────────────────
// STARTER ROUTES (not yet lazy-loaded)
// ─────────────────────────────────────────────

// Placeholder component classes (would be in separate files in a real app)
class HomeComponent {}
class UserListComponent {}
class UserDetailComponent /* implements OnInit */ {
  user: User | null = null;

  // In a real Angular component you'd inject ActivatedRoute:
  // private route = inject(ActivatedRoute);

  // ngOnInit(): void {
  //   TODO 3: Instead of snapshot, subscribe to params as an Observable.
  //   Replace the snapshot approach below with an observable subscription.
  //
  //   BROKEN (snapshot — stale if user navigates /users/1 → /users/2):
  //   const id = this.route.snapshot.paramMap.get('id');
  //   this.user = new UserService().getUser(id!);
  //
  //   FIXED: subscribe to this.route.paramMap so it reacts to param changes:
  //   this.route.paramMap.subscribe(params => {
  //     const id = params.get('id');
  //     this.user = new UserService().getUser(id!);
  //   });
  // }
}

// TODO 1: Convert the 'users' route below to use loadComponent (lazy loading).
// Replace `component: UserListComponent` with a loadComponent that
// dynamically imports from './user-list/user-list.component'.
// (In this file, just write the route object structure as a comment.)

// TODO 2: Write a userResolver using the ResolveFn<User> signature.
// It should read the 'id' param from the route and call UserService.getUser(id).
// Then attach it to the users/:id route via the resolve property.

// Current routes (NOT lazy-loaded, NO resolver):
// const routes: Routes = [
//   { path: '', component: HomeComponent },
//   { path: 'users', component: UserListComponent },           // TODO 1: make lazy
//   { path: 'users/:id', component: UserDetailComponent },    // TODO 2: add resolver
// ];

// Write your answers as comments below:

// TODO 1 answer — lazy route for users:
// {
//   path: 'users',
//   loadComponent: () => ???
// }

// TODO 2 answer — resolver function:
// const userResolver: ResolveFn<User> = (route) => {
//   ???
// };

// TODO 2 answer — route with resolver attached:
// {
//   path: 'users/:id',
//   component: UserDetailComponent,
//   resolve: { ??? }
// }

// ─────────────────────────────────────────────
// Verification helpers
// ─────────────────────────────────────────────

function verifyUserService(): void {
  const svc = new UserService();
  const user = svc.getUser("42");
  console.log("User fetched:", user.id === "42" && user.name === "User 42"); // true
}

verifyUserService();

export { UserDetailComponent, UserListComponent, HomeComponent };
export type { User };
