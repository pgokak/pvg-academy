---
title: "RxJS & Observables"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```typescript
// Callback hell — nested async operations
getUserDetails(userId: string, callback: (user: User) => void) {
  fetch(`/api/users/${userId}`, (userErr, user) => {
    if (userErr) return callback(null);
    fetch(`/api/users/${userId}/orders`, (ordersErr, orders) => {
      if (ordersErr) return callback(null);
      fetch(`/api/notifications?userId=${userId}`, (notifErr, notifs) => {
        // 3 levels deep just to combine 3 API calls
        // No cancellation, error handling on every level, no debouncing
        callback({ ...user, orders, notifications: notifs });
      });
    });
  });
}
```

## Mental Model

An Observable is a lazy stream of values over time. Nothing happens until someone subscribes. Unlike a Promise, it can emit multiple values (think: search results as you type, WebSocket messages, timer ticks) and can be cancelled. RxJS gives you operators to transform, combine, and control these streams.

## Observable vs Promise

|               | Observable                              | Promise               |
| ------------- | --------------------------------------- | --------------------- |
| Values        | 0 to N over time                        | Exactly 1             |
| Lazy          | Yes — nothing runs until `.subscribe()` | No — runs immediately |
| Cancellable   | Yes — unsubscribe                       | No                    |
| Operators     | 100+ (map, filter, switchMap...)        | Only .then/.catch     |
| Sync or Async | Both                                    | Async only            |

## Creating Observables

```typescript
import { of, from, interval, fromEvent, Observable } from "rxjs";

of(1, 2, 3); // Emits 1, 2, 3 synchronously then completes
from([1, 2, 3]); // Same as of for arrays
from(fetch("/api")); // Wraps a Promise
interval(1000); // Emits 0, 1, 2, 3... every second
fromEvent(button, "click"); // Emits on every click

// Custom Observable
new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});
```

## Key Operators

```typescript
import {
  map,
  filter,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  catchError,
  takeUntil,
} from "rxjs/operators";

// Transform each value
obs$.pipe(map((user) => user.name));

// Filter values
obs$.pipe(filter((user) => user.isActive));

// For each emission, cancel previous and start a new inner Observable
// Perfect for search: debounce user input, then call API
searchInput$.pipe(
  debounceTime(300), // Wait 300ms after last keystroke
  distinctUntilChanged(), // Don't search if value didn't change
  switchMap(
    (
      query, // Cancel previous API call if user keeps typing
    ) => this.http.get<User[]>(`/api/users?q=${query}`),
  ),
);

// Catch errors and recover
obs$.pipe(catchError((err) => of([]))); // Return empty array on error
```

## Subject and BehaviorSubject

```typescript
// Subject = both Observable and Observer
// Use for events: anyone can emit, anyone can subscribe
const clicks$ = new Subject<MouseEvent>();
clicks$.next(event);     // Emit
clicks$.subscribe(e => console.log(e)); // Subscribe

// BehaviorSubject = has a current value
// Use for state: new subscribers immediately get the current value
const user$ = new BehaviorSubject<User | null>(null);
user$.next(loggedInUser);         // Update state
user$.getValue();                 // Read current value synchronously
user$.subscribe(u => /* always gets current + future values */);
```

## Memory Leak Prevention

```typescript
// takeUntilDestroyed (Angular 16+) — cleanest approach
export class SearchComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.searchService.results$
      .pipe(
        takeUntilDestroyed(this.destroyRef), // Auto-unsubscribes on destroy
      )
      .subscribe((results) => (this.results = results));
  }
}
```

## Common Mistake

Subscribing inside `switchMap` — creates nested subscriptions and potential memory leaks:

```typescript
// WRONG — nested subscribe
this.route.params.subscribe((params) => {
  this.userService.getUser(params["id"]).subscribe((user) => {
    this.user = user; // Nested subscribe — previous inner subscription never cancelled
  });
});

// RIGHT — switchMap flattens and cancels previous inner subscription
this.route.params
  .pipe(
    switchMap((params) => this.userService.getUser(params["id"])),
    takeUntilDestroyed(this.destroyRef),
  )
  .subscribe((user) => (this.user = user));
```

## When to Reach For This

- HTTP calls in Angular — HttpClient returns Observables
- User input debouncing (search as you type) — `debounceTime` + `switchMap`
- Combining multiple API calls — `forkJoin` (parallel) or `switchMap` (sequential)
- Shared state across components — `BehaviorSubject` in a service
- WebSockets, SSE, real-time data — naturally a stream of values
- Cancel in-flight requests on navigation — `takeUntilDestroyed`
