// Angular Advanced Routing — Solution
// Commented imports (would resolve in a real Angular project):
// import { Routes, ResolveFn, ActivatedRoute, Router } from '@angular/router';
// import { Component, OnInit, inject } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

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
// Solution 2: Resolver — fetches user before route activates
// ─────────────────────────────────────────────

// const userResolver: ResolveFn<User> = (route) => {
//   const userService = inject(UserService);
//   const id = route.paramMap.get('id')!;
//   return userService.getUser(id);
//   // If getUser returned an Observable, Angular would wait for it to complete
//   // before activating the route — no empty flash in the template.
// };

// ─────────────────────────────────────────────
// Solution 1 + 2: Lazy route with resolver attached
// ─────────────────────────────────────────────

// const routes: Routes = [
//   { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
//
//   // Solution 1: lazy-loaded with loadComponent
//   {
//     path: 'users',
//     loadComponent: () =>
//       import('./user-list/user-list.component').then(m => m.UserListComponent)
//   },
//
//   // Solution 2: resolver attached — component renders with data ready
//   {
//     path: 'users/:id',
//     loadComponent: () =>
//       import('./user-detail/user-detail.component').then(m => m.UserDetailComponent),
//     resolve: { user: userResolver }
//   }
// ];

// ─────────────────────────────────────────────
// Solution 3: Component that reacts to param changes (observable, not snapshot)
// ─────────────────────────────────────────────

// @Component({
//   selector: 'app-user-detail',
//   template: `
//     <h1>{{ user?.name }}</h1>
//     <p>{{ user?.email }}</p>
//   `
// })
class UserDetailComponent /* implements OnInit */ {
  user: User | null = null;

  // private route = inject(ActivatedRoute);

  // Solution for reading resolver data:
  // ngOnInit(): void {
  //   // Read resolver data (available once because resolver ran before activation)
  //   this.user = this.route.snapshot.data['user'];
  //
  //   // Solution 3: Subscribe to paramMap so it reacts when user navigates
  //   // from /users/1 to /users/2 without destroying this component
  //   this.route.paramMap
  //     .pipe(takeUntilDestroyed())  // auto-unsubscribe on destroy
  //     .subscribe(params => {
  //       const id = params.get('id')!;
  //       this.user = new UserService().getUser(id);
  //     });
  // }

  navigateToUser(id: string): void {
    // router.navigate() for programmatic navigation (from TS logic)
    // this.router.navigate(['/users', id]);
    // Use routerLink="/users/{{id}}" in template instead when possible
  }
}

class UserListComponent {}
class HomeComponent {}

// ─────────────────────────────────────────────
// Verification
// ─────────────────────────────────────────────

function verifyResolver(): void {
  // Simulate what the resolver does
  const svc = new UserService();
  const id = "42";
  const user: User = svc.getUser(id);

  console.log("Resolver returns correct user:", user.id === "42"); // true
  console.log("User has expected shape:", "name" in user && "email" in user); // true
}

function verifyLazyRouteStructure(): void {
  // Validate the route object structure (plain object, no Angular needed)
  const mockRoute: {
    path: string;
    loadComponent: () => Promise<unknown>;
  } = {
    path: "users",
    loadComponent: () => Promise.resolve({ UserListComponent }),
  };

  console.log(
    "Lazy route has loadComponent:",
    typeof mockRoute.loadComponent === "function",
  ); // true
  console.log("Lazy route path correct:", mockRoute.path === "users"); // true
}

verifyResolver();
verifyLazyRouteStructure();

export { UserDetailComponent, UserListComponent, HomeComponent };
export type { User };
