---
title: "Directives"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```html
<!-- Same conditional rendering copy-pasted in 5 components -->
<!-- user-list.component.html -->
<div *ngIf="isAdmin" class="admin-panel">...</div>

<!-- dashboard.component.html -->
<div *ngIf="isAdmin" class="admin-panel">...</div>

<!-- Same class-toggling logic everywhere -->
<button class="{{ isActive ? 'btn btn-active' : 'btn' }}">Click</button>
```

Template logic duplicated. No reuse. Change the rule, update every template.

## Mental Model

A directive is a reusable instruction to the DOM. `*ngIf` says "show this if...". `*ngFor` says "repeat this for each...". `ngClass` says "apply these classes based on conditions." Custom directives say anything you want — define once, use everywhere.

## Structural Directives — Change the DOM Structure

```html
<!-- *ngIf / @if — add or remove elements -->
<div *ngIf="users.length > 0; else noUsers">
  <!-- rendered when condition is true -->
</div>
<ng-template #noUsers>
  <p>No users found.</p>
</ng-template>

<!-- Angular 17+ @if — better type narrowing, no ng-template needed -->
@if (selectedUser) {
<p>{{ selectedUser.name }}</p>
<!-- TypeScript knows selectedUser is not null here -->
} @else {
<p>No user selected</p>
}

<!-- *ngFor / @for — repeat for each item -->
<li *ngFor="let user of users; let i = index; trackBy: trackByUserId">
  {{ i + 1 }}. {{ user.name }}
</li>

<!-- Angular 17+ @for — requires track expression -->
@for (user of users; track user.id) {
<li>{{ user.name }}</li>
} @empty {
<li>No users</li>
}

<!-- *ngSwitch / @switch -->
@switch (user.role) { @case ('ADMIN') { <span class="badge-admin">Admin</span> }
@case ('USER') { <span class="badge-user">User</span> } @default {
<span class="badge-guest">Guest</span> } }
```

## Attribute Directives — Change Appearance/Behavior

```html
<!-- ngClass — dynamic CSS classes -->
<div
  [ngClass]="{
  'active': user.isActive,
  'admin': user.role === 'ADMIN',
  'error': hasError
}"
>
  {{ user.name }}
</div>

<!-- ngStyle — dynamic inline styles -->
<div
  [ngStyle]="{
  'color': user.isActive ? 'green' : 'gray',
  'font-weight': user.role === 'ADMIN' ? 'bold' : 'normal'
}"
>
  {{ user.name }}
</div>
```

## Custom Directive

```typescript
// HighlightDirective — changes background color on hover
@Directive({
  selector: "[appHighlight]", // Attribute selector: <p appHighlight>
  standalone: true,
})
export class HighlightDirective {
  @Input("appHighlight") highlightColor: string = "yellow";

  @HostBinding("style.backgroundColor")
  backgroundColor: string = "";

  @HostListener("mouseenter")
  onMouseEnter(): void {
    this.backgroundColor = this.highlightColor;
  }

  @HostListener("mouseleave")
  onMouseLeave(): void {
    this.backgroundColor = "";
  }
}

// Usage: <p appHighlight="lightblue">Hover over me</p>
```

## Common Mistake

Forgetting to use `trackBy` (or `track` in Angular 17+) in `*ngFor` — Angular recreates all DOM nodes on every array change:

```html
<!-- WRONG — rebuilds ALL DOM nodes when array changes, even for unrelated items -->
<li *ngFor="let user of users">{{ user.name }}</li>

<!-- RIGHT — Angular identifies which items changed by ID, only re-renders those -->
<li *ngFor="let user of users; trackBy: trackByUserId">{{ user.name }}</li>

<!-- Angular 17+ @for — track is REQUIRED (the compiler enforces it) -->
@for (user of users; track user.id) {
<li>{{ user.name }}</li>
}
```

```typescript
trackByUserId(index: number, user: User): number {
  return user.id; // Stable identity — Angular keeps DOM nodes that have the same ID
}
```

## When to Reach For This

- Conditional content — `@if` / `*ngIf` (show/hide without null checks in class)
- List rendering — `@for` / `*ngFor` (always with `track`)
- Dynamic CSS — `[ngClass]` or `[class.myClass]`
- Reusable DOM behavior (tooltip, drag, highlight, auto-focus) — custom `@Directive`
- When the same template behavior appears in 3+ places — extract to a directive
