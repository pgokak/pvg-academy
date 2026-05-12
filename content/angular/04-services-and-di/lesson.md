---
title: "Services & Dependency Injection"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```typescript
// Data fetching logic directly in the component — can't reuse
@Component({ selector: "app-user-list" })
export class UserListComponent implements OnInit {
  users: User[] = [];

  ngOnInit(): void {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => (this.users = data));
    // Same fetch() duplicated in UserSearchComponent, UserDashboardComponent...
  }
}
```

Every component that needs users writes its own HTTP call. Change the API URL once — find every component that has it. Can't test components without making real HTTP calls.

## Mental Model

A service is a singleton specialist. The DI container creates it once and hands the same instance to every component that needs it — shared logic, no duplication. Components are managers; services are the specialists they delegate to.

## @Injectable — Registering with the Container

```typescript
// providedIn: 'root' = application-wide singleton
// Created once, shared by everyone
@Injectable({ providedIn: "root" })
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>("/api/users");
  }
}

// Different scopes:
// providedIn: 'root'    → one instance for the whole app
// providedIn: 'any'     → one instance per lazy-loaded module
// providers: [UserService] in @Component → one instance per component tree
```

## Constructor Injection and inject()

```typescript
// Classic: constructor injection
@Component({ selector: "app-user-list" })
export class UserListComponent {
  constructor(private userService: UserService) {}
}

// Angular 14+: inject() function — works anywhere, not just constructors
@Component({ selector: "app-user-list" })
export class UserListComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  // Cleaner for multiple dependencies, works in signals/computed
}
```

## Clean Component with Service

```typescript
@Injectable({ providedIn: "root" })
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>("/api/users");
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  createUser(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>("/api/users", data);
  }
}

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading) {
      <p>Loading...</p>
    }
    @if (error) {
      <p class="error">{{ error }}</p>
    }
    @for (user of users; track user.id) {
      <app-user-card [user]="user" />
    }
  `,
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  users: User[] = [];
  isLoading = false;
  error = "";

  ngOnInit(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      },
    });
  }
}
```

## Common Mistake

Injecting `HttpClient` directly in a component instead of through a service:

```typescript
// WRONG — component knows about HTTP details, logic can't be reused
@Component({ ... })
export class UserListComponent implements OnInit {
  constructor(private http: HttpClient) {} // Direct HTTP in component

  ngOnInit(): void {
    this.http.get<User[]>('/api/users').subscribe(users => this.users = users);
    // Now every other component that needs users must duplicate this
  }
}

// RIGHT — component depends on service, not HTTP
@Component({ ... })
export class UserListComponent implements OnInit {
  constructor(private userService: UserService) {} // Service abstraction

  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => this.users = users);
    // UserSearchComponent, UserDashboardComponent get the same getUsers() for free
  }
}
```

## When to Reach For This

- Any data fetching or mutation — always in a service, never directly in a component
- Any logic that appears in two or more components — extract to a service
- Shared state across components (currently logged-in user, feature flags) — singleton service
- When you want to unit test business logic without rendering a component — inject a mock service
- Third-party integrations (analytics, notifications, storage) — wrap in an Angular service
