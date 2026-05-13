---
title: "Change Detection"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

Imagine a component that renders a list of 1000 users. With Angular's default change detection, every time the user moves their mouse, a timer ticks, or any unrelated HTTP response arrives — Angular checks every single binding on every single component in the entire tree. Your list re-renders constantly. The app becomes sluggish, frames drop, users notice the jank.

```typescript
// This component re-renders on EVERY async event in the app
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-user-list',
//   template: `<div *ngFor="let user of users">{{ user.name }}</div>`
// })
class UserListComponent {
  users: { id: number; name: string }[] = Array.from(
    { length: 1000 },
    (_, i) => ({
      id: i,
      name: `User ${i}`,
    }),
  );

  // Problem: even if users never changes, this re-renders on every mouse move
  // because Zone.js triggers a full app-wide change detection cycle
}
```

## Mental Model

Default change detection is a security guard who checks every room every time anyone walks in the building. OnPush is a guard who only checks a room when someone knocks on that specific door.

With `OnPush`, Angular skips your component entirely unless something specific happens — an `@Input` reference changes, an `async` pipe emits a new value, or you explicitly knock on the door with `markForCheck()`.

## How Angular's Default Change Detection Works

Zone.js is a library that monkey-patches every async API in the browser: `setTimeout`, `setInterval`, `Promise.then`, `addEventListener`, XHR, fetch. After any of these complete, Zone.js tells Angular: "something may have changed — run change detection."

Angular then walks the entire component tree from root to leaf, checking every bound expression. With 100 components, that's 100 checks. With `Default` strategy, this happens after every event.

```typescript
// Zone.js intercepts ALL of these and triggers a full check:
setTimeout(() => {
  /* ... */
}, 100);
document.addEventListener("mousemove", handler);
fetch("/api/data").then(/* ... */);
```

## Two Strategies: Default vs OnPush

```typescript
// import { Component, ChangeDetectionStrategy } from '@angular/core';

// Strategy 1: Default (the security guard checking every room)
// @Component({
//   changeDetection: ChangeDetectionStrategy.Default  // implicit
// })
class DefaultComponent {
  // Checked after EVERY async event in the entire app
}

// Strategy 2: OnPush (guard only checks when you knock)
// @Component({
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
class OnPushComponent {
  // Checked ONLY when:
  // 1. An @Input reference changes (not mutation — a new reference)
  // 2. An async pipe emits a new value
  // 3. An event originates from this component or its children
  // 4. You manually call markForCheck() or detectChanges()
}
```

## ChangeDetectorRef: Knocking on the Door Manually

When you use `OnPush` but need to trigger a check yourself — for example, after data arrives via a callback or a subscription you manage manually:

```typescript
// import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';

class UserListComponent {
  users: { id: number; name: string }[] = [];

  // inject or constructor-inject ChangeDetectorRef
  // private cdr = inject(ChangeDetectorRef);

  loadUsersViaCallback(): void {
    someCallbackBasedApi((data: { id: number; name: string }[]) => {
      this.users = data;

      // Angular doesn't know this callback fired — tell it to check this component
      // (and its ancestors up to the root) on the next cycle
      // this.cdr.markForCheck();
    });
  }

  // detectChanges() runs the check RIGHT NOW, synchronously
  // Use when you can't wait for the next cycle
  loadUsersAndUpdateNow(): void {
    this.users = [{ id: 1, name: "Alice" }];
    // this.cdr.detectChanges();
  }
}
```

**`markForCheck()`** — marks this component and its ancestors as dirty; the check happens on the next detection cycle (usually the next frame).

**`detectChanges()`** — runs change detection on this component and its children immediately, synchronously. Use when you need the DOM updated right now (e.g., before taking a screenshot or measurement).

## Why OnPush Requires Immutable Data

This is the most common source of bugs when adopting `OnPush`:

```typescript
class UserListComponent {
  users: { id: number; name: string }[] = [{ id: 1, name: "Alice" }];

  // BAD: mutates the array — reference is the same, OnPush won't detect this
  addUserBroken(user: { id: number; name: string }): void {
    this.users.push(user); // same array reference — OnPush sees no change
  }

  // GOOD: creates a new array — reference changes, OnPush detects this
  addUserCorrect(user: { id: number; name: string }): void {
    this.users = [...this.users, user]; // new reference — OnPush triggers
  }

  // GOOD: same principle for objects
  updateUserCorrect(id: number, name: string): void {
    this.users = this.users.map(
      (u) => (u.id === id ? { ...u, name } : u), // new object reference for changed item
    );
  }
}
```

Angular's `OnPush` uses reference equality (`===`) to decide if an `@Input` changed. Two objects with identical contents but different references are considered "changed." Two references pointing to the same mutated object are considered "unchanged."

## How Signals Bypass Zone.js Entirely

Angular Signals (Angular 16+) are a reactive primitive that enables fine-grained, surgical updates without Zone.js involvement:

```typescript
// import { Component, signal, computed } from '@angular/core';

class SignalsComponent {
  // A signal holds a value and notifies dependents when it changes
  // users = signal<{ id: number; name: string }[]>([]);
  // count = computed(() => this.users().length); // derived signal

  addUser(user: { id: number; name: string }): void {
    // update() takes a function: current value → new value
    // this.users.update(current => [...current, user]);
    // Angular knows EXACTLY which template bindings depend on this signal
    // and updates only those — no zone.js, no full tree walk
  }
}
```

With Signals, you don't need `OnPush` (though they work together). Angular tracks which template bindings read which signals and only re-renders those bindings when a signal changes.

## Default vs OnPush Performance Impact

```
Scenario: 50 components, user moves mouse (triggers 60 events/sec)

Default strategy:
  - Each event: 50 components checked
  - 60 events/sec × 50 checks = 3,000 checks/sec
  - Result: CPU constantly busy, 60fps drops to 30fps

OnPush strategy (data only changes on button click):
  - Mouse events: 0 components checked (none are "dirty")
  - Button click: 1 component checked (only the one with new Input reference)
  - Result: CPU free for rendering, stable 60fps
```

## Common Mistake

Mutating an array with `push()` instead of creating a new array — `OnPush` won't detect the change because the reference didn't change.

```typescript
// BEFORE (broken with OnPush):
this.users.push(newUser);
// Angular sees: old reference === new reference → skip check → UI stuck

// AFTER (correct):
this.users = [...this.users, newUser];
// Angular sees: old reference !== new reference → run check → UI updates
```

The same applies to objects: `this.user.name = 'Bob'` won't trigger OnPush. Use `this.user = { ...this.user, name: 'Bob' }`.

## When to Reach For This

- Any component that renders a list of more than ~50 items and updates frequently
- Components used in a performance-sensitive context (dashboards, data tables, real-time feeds)
- When you notice CPU usage spiking or frame rates dropping during interactions
- Any "leaf" component that only depends on its `@Input` values (most presentational components)
- When migrating to Signals — `OnPush` is the stepping stone; Signals are the destination
