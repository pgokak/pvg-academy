---
title: "Lifecycle Hooks"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```typescript
export class UserComponent {
  constructor(private userService: UserService) {
    // DANGER: too early — @ViewChild refs don't exist yet,
    // inputs haven't been set, and the DOM isn't rendered
    this.user = this.userService.getUser(this.userId); // this.userId is undefined!

    // Memory leak: interval keeps running after the component is destroyed
    setInterval(() => this.refreshData(), 5000);
  }
}
```

Putting side effects in the constructor fires before Angular has wired up inputs and the DOM. Subscriptions started here and never cleaned up leak memory and cause errors on destroyed components.

## Mental Model

Think of a component's life as a job at a company. The constructor is signing the employment contract — you exist, but you're not at your desk yet. `ngOnInit` is your first day at work — inputs are set, DOM is ready. `ngOnDestroy` is handing in your laptop on the last day — clean up everything you started so the next person (garbage collector) can reclaim the space.

## The Hook Table

| Hook              | When it fires                                        | Typical use                                         |
| ----------------- | ---------------------------------------------------- | --------------------------------------------------- |
| `constructor`     | Before Angular sets inputs                           | Inject dependencies only                            |
| `ngOnChanges`     | Before `ngOnInit`, then on every `@Input` change     | React to input changes, compare previous vs current |
| `ngOnInit`        | Once, after first `ngOnChanges`                      | Fetch data, set up subscriptions                    |
| `ngAfterViewInit` | After the component's view and child views are ready | Access `@ViewChild` / DOM refs                      |
| `ngOnDestroy`     | Just before the component is removed                 | Cancel timers, close subscriptions                  |

## ngOnInit — The Safe Starting Block

```typescript
import { Component, OnInit, Input, inject } from '@angular/core';
import { UserService } from './user.service';

@Component({ ... })
export class UserDetailComponent implements OnInit {
  @Input({ required: true }) userId!: number;
  user?: User;

  private userService = inject(UserService);

  ngOnInit(): void {
    // Safe: userId is now set by the parent
    this.userService.getUser(this.userId).subscribe((u) => (this.user = u));
  }
}
```

## ngOnChanges — Reacting to Input Changes

```typescript
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({ ... })
export class ChartComponent implements OnChanges {
  @Input() data: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // SimpleChanges has a key per changed @Input
    if (changes['data']) {
      const prev = changes['data'].previousValue;
      const curr = changes['data'].currentValue;
      console.log('data changed:', prev, '→', curr);
      this.redrawChart();
    }
  }

  private redrawChart(): void { /* ... */ }
}
```

## ngOnDestroy — Preventing Memory Leaks

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({ ... })
export class TimerComponent implements OnInit, OnDestroy {
  count = 0;
  private subscription!: Subscription;

  ngOnInit(): void {
    // interval keeps emitting until unsubscribed
    this.subscription = interval(1000).subscribe(() => this.count++);
  }

  ngOnDestroy(): void {
    // Must unsubscribe — otherwise this component stays alive in memory
    this.subscription.unsubscribe();
  }
}
```

## DestroyRef — The Modern Pattern

`DestroyRef` + `takeUntilDestroyed` replaces the manual `ngOnDestroy` / `Subscription` pattern:

```typescript
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({ ... })
export class TimerComponent implements OnInit {
  count = 0;
  // inject() inside the class field initialiser — injection context is active
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef)) // auto-completes on destroy
      .subscribe(() => this.count++);
    // No ngOnDestroy needed
  }
}
```

## Common Mistake

Fetching data in the constructor — inputs are not yet set, so you read `undefined`:

```typescript
// WRONG
constructor(private service: UserService) {
  // this.userId is undefined — @Input hasn't been applied yet
  this.service.getUser(this.userId).subscribe(...);
}

// RIGHT
ngOnInit(): void {
  // @Input userId is now the value the parent passed
  this.service.getUser(this.userId).subscribe(...);
}
```

## When to Reach For This

- Starting data fetches or subscriptions — `ngOnInit`
- Accessing `@ViewChild` or child component refs — `ngAfterViewInit`
- Responding to changing `@Input` values — `ngOnChanges`
- Cleaning up timers, subscriptions, event listeners — `ngOnDestroy` or `takeUntilDestroyed`
- Injecting `DestroyRef` for automatic cleanup without `ngOnDestroy` boilerplate
