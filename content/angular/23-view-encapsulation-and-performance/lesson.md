---
title: "View Encapsulation & Performance"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

A developer adds `.btn { color: red }` inside `ButtonComponent.css`. Two days later, a seemingly unrelated `CardComponent` has mysteriously red buttons too. The team spends an hour debugging CSS across 20 files to find the source.

Meanwhile, a simple data update in a parent component triggers all 50 child components to re-render — the page stutters on every keystroke in a filter input.

```typescript
// Style leak without encapsulation:
// ButtonComponent has: .btn { color: red; font-weight: bold; }
// CardComponent uses <button class="btn"> but didn't define .btn
// Result: ButtonComponent's style leaks into CardComponent → red buttons everywhere
// Finding the source: open DevTools, see _ngcontent-abc-c1 missing on the card's button
// Time lost: 45 minutes
```

## Mental Model

View encapsulation is a glass box around each component's styles — they can see out but their styles can't escape. Each component is responsible only for what's inside its own glass box.

Performance optimization is teaching Angular which doors to knock on instead of running through every room. `trackBy` gives each list item a key so Angular knows which ones actually changed. `@defer` means "don't even load this module until the user can see it."

## View Encapsulation Modes

### Emulated (Default)

Angular adds unique attributes like `_ngcontent-c1` to component elements and scopes styles with attribute selectors:

```css
/* You write: */
/* .btn { color: red; } */

/* Angular transforms to: */
/* .btn[_ngcontent-c1] { color: red; } */
/* Only elements with this attribute (inside this component) are styled */
```

```typescript
// import { Component, ViewEncapsulation } from '@angular/core';
// @Component({
//   selector: 'app-button',
//   encapsulation: ViewEncapsulation.Emulated, // DEFAULT — you rarely need to set this
//   styles: ['.btn { color: red; }']
// })
// class ButtonComponent {}
```

### None — Global Styles

```typescript
// @Component({
//   encapsulation: ViewEncapsulation.None
// })
// Use for: component that intentionally sets global styles (theme provider, reset, typography)
// WARNING: all styles from this component become global — can affect any element in the app
```

### ShadowDom — Native Browser Shadow DOM

```typescript
// @Component({
//   encapsulation: ViewEncapsulation.ShadowDom
// })
// Uses the browser's native Shadow DOM API. Styles are truly isolated at the browser level.
// Trade-off: less browser support for certain CSS features, harder to override from outside
```

## :host, :host-context, and ::ng-deep

```css
/* :host — style the component's own root element */
/* :host {
  display: block;
  border: 1px solid #ccc;
} */

/* :host(.active) — style the host when it has the 'active' class */
/* :host(.active) {
  border-color: blue;
} */

/* :host-context(.dark-theme) — style when an ANCESTOR has the dark-theme class */
/* :host-context(.dark-theme) {
  background-color: #1a1a1a;
  color: white;
} */

/* ::ng-deep — pierce encapsulation to style child component internals */
/* :host ::ng-deep .mat-button { color: red; } */
/* WARNING: ::ng-deep is deprecated. Use CSS custom properties for theming instead. */
```

## CSS Custom Properties for Theming (::ng-deep Alternative)

```css
/* ButtonComponent — expose a CSS variable: */
/* .btn {
  color: var(--btn-color, blue);  /* default: blue, overridable from parent
} */

/* Parent component — customize without ::ng-deep: */
/* app-button {
  --btn-color: red;  /* overrides the default inside ButtonComponent
} */
```

## Performance: trackBy in @for / \*ngFor

Without `trackBy`, Angular destroys and recreates every DOM element when the array reference changes — even if only one item changed:

```typescript
// BAD — no trackBy: every data refresh destroys all 1000 <li> elements and recreates them
// <ul>
//   <li *ngFor="let user of users">{{ user.name }}</li>
// </ul>

// GOOD — with trackBy: Angular identifies which items changed by their id
// <ul>
//   <li *ngFor="let user of users; trackBy: trackById">{{ user.name }}</li>
// </ul>

// Angular 17+ @for syntax (built-in trackBy):
// @for (user of users; track user.id) {
//   <li>{{ user.name }}</li>
// }

class UserListComponent {
  users: { id: number; name: string }[] = [];

  // trackBy function for *ngFor (not needed with @for's track expression):
  trackById(_index: number, user: { id: number; name: string }): number {
    return user.id;
  }
}
```

## async Pipe — Auto-Unsubscribe + OnPush Compatible

```typescript
// The async pipe subscribes to an Observable or Promise in the template,
// updates the view when a new value arrives, and automatically unsubscribes
// when the component is destroyed.

// It also triggers OnPush change detection automatically — no markForCheck() needed.

// class UserListComponent {
//   users$ = this.userService.getUsers(); // Observable<User[]> — no subscribe needed
// }

// Template:
// <li *ngFor="let user of users$ | async; trackBy: trackById">{{ user.name }}</li>
```

## Pure Pipes — Recalculate Only When Input Reference Changes

```typescript
// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({ name: 'filterActive', pure: true }) // pure: true is the default
// class FilterActivePipe implements PipeTransform {
//   transform(users: User[]): User[] {
//     return users.filter(u => u.active);
//   }
// }
// A pure pipe only runs when the input reference changes.
// If you push to the array (same reference), the pipe doesn't re-run — use immutable updates.
```

## NgOptimizedImage — LCP Performance

```typescript
// import { NgOptimizedImage } from '@angular/common';

// <img ngSrc="/hero.jpg" width="1200" height="400" priority>
// - Adds fetchpriority="high" for LCP images
// - Automatically adds width/height to prevent layout shift
// - Warns if image is displayed at wrong size
// - Adds loading="lazy" for non-priority images
```

## @defer — Lazy Load Heavy Components

The `@defer` block (Angular 17+) delays loading and rendering a component until a condition is met:

```typescript
// @defer (on viewport) {
//   <app-heavy-chart [data]="chartData" />
// } @loading {
//   <div class="skeleton">Loading chart...</div>
// } @error {
//   <p>Chart failed to load.</p>
// }
// The chart's JavaScript bundle is not even downloaded until it scrolls into the viewport.

// Other triggers:
// @defer (on idle)        → load when browser is idle
// @defer (on interaction) → load when user clicks/hovers this element
// @defer (when isVisible) → load when a condition expression becomes truthy
// @defer (on timer(2s))   → load after 2 seconds
```

## Common Mistake

Using `::ng-deep` everywhere to force style overrides — the styles escape encapsulation and become global, leaking into unrelated components.

```css
/* BEFORE (leaks globally): */
/* :host ::ng-deep .mat-button { color: red; } */
/* This applies to EVERY mat-button in the entire app when this component is loaded */

/* AFTER (properly scoped with CSS variables): */
/* ButtonComponent exposes: */
/* .mat-button { color: var(--custom-btn-color, inherit); } */

/* Parent overrides just its own instance: */
/* app-my-form {
  --custom-btn-color: red;
} */
```

## When to Reach For This

- Any large list (50+ items) that updates frequently — always add `trackBy` or use `@for track`
- Components that render nested third-party widgets with their own styles (use `ViewEncapsulation.None` carefully)
- Global themes or design tokens — expose them as CSS custom properties, override from outside without `::ng-deep`
- Heavy components like charts, PDF viewers, rich text editors — use `@defer` to avoid including them in the initial bundle
- Images above the fold (hero images, logos) — use `NgOptimizedImage` with `priority`
