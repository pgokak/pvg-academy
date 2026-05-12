---
title: "HTTP Client"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```typescript
// Raw fetch() in Angular — no types, no error handling, no change detection
async ngOnInit(): Promise<void> {
  const response = await fetch('/api/users');
  const data = await response.json();  // Type: any
  this.users = data;                   // Angular may not detect this change (Zone.js issue)
  // No cancellation, no retry, no interceptors, no observable composition
}
```

`fetch()` works but bypasses everything Angular provides: typed responses, interceptors, observable composition, automatic error handling, and Change Detection integration.

## Mental Model

HttpClient is a typed, observable-based fetch. It returns a stream you can transform, combine, and cancel — not a one-shot promise. You declare what you expect (`get<User[]>()`) and Angular handles the rest.

## Setup

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // With interceptors:
    // provideHttpClient(withInterceptors([authInterceptor]))
  ],
};
```

## Basic Methods

```typescript
@Injectable({ providedIn: "root" })
export class ApiService {
  private http = inject(HttpClient);

  // GET — typed response
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>("/api/users");
  }

  // GET with query params
  searchUsers(query: string, page: number): Observable<Page<User>> {
    const params = new HttpParams()
      .set("q", query)
      .set("page", page.toString());
    return this.http.get<Page<User>>("/api/users/search", { params });
  }

  // POST — send body, receive created resource
  createUser(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>("/api/users", data);
  }

  // PUT — full replacement
  updateUser(id: number, data: User): Observable<User> {
    return this.http.put<User>(`/api/users/${id}`, data);
  }

  // DELETE — no response body
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }
}
```

## Error Handling

```typescript
getUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users').pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        return throwError(() => new Error('Please log in'));
      } else if (err.status === 404) {
        return of([]);  // Return empty array for 404
      }
      return throwError(() => new Error('Server error'));
    })
  );
}
```

## async Pipe — Subscribe in Template

```typescript
@Component({
  template: `
    <!-- async pipe subscribes + unsubscribes automatically -->
    @if (users$ | async; as users) {
      @for (user of users; track user.id) {
        <p>{{ user.name }}</p>
      }
    }
  `,
})
export class UserListComponent {
  // No ngOnInit needed — template subscribes via async pipe
  users$ = inject(UserService).getUsers();
}
```

## Common Mistake

Not handling errors — the observable silently completes on error if no `error` handler:

```typescript
// WRONG — no error handling
this.http.get<User[]>("/api/users").subscribe(
  (users) => (this.users = users),
  // If server returns 500: nothing happens, users stays empty, no feedback to user
);

// RIGHT — explicit error handler
this.http.get<User[]>("/api/users").subscribe({
  next: (users) => {
    this.users = users;
  },
  error: (err: HttpErrorResponse) => {
    this.errorMessage = err.status === 404 ? "Not found" : "Failed to load";
  },
});
```

## When to Reach For This

- Any HTTP call in an Angular app — always HttpClient, never raw fetch()
- API calls that need auth headers — interceptors handle this automatically
- Observable chaining (load user, then load their orders) — use `switchMap`
- When you need to cancel in-flight requests on navigation — `takeUntilDestroyed` + operator
- When the template subscribes — use `async` pipe to avoid manual subscribe/unsubscribe
