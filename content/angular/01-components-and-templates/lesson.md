---
title: "Components & Templates"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```javascript
// Raw DOM manipulation — imperative, fragile
const userCard = document.getElementById("user-card");
const nameEl = document.createElement("h3");
nameEl.textContent = user.name;
userCard.appendChild(nameEl);

const emailEl = document.createElement("p");
emailEl.textContent = user.email;
userCard.appendChild(emailEl);

const button = document.createElement("button");
button.textContent = "Select";
button.addEventListener("click", () => selectUser(user));
userCard.appendChild(button);

// To update: clear and rebuild, or track every element reference
// To reuse: copy-paste this block everywhere
// To test: requires a real browser DOM
```

## Mental Model

A component is a custom HTML tag with superpowers. `<app-user-card [user]="alice">` is just HTML — but Angular knows it means "render this class's template with this data." You define what it looks like (template) and how it behaves (class). Angular connects them.

## @Component Anatomy

```typescript
@Component({
  selector: "app-user-card", // The HTML tag name: <app-user-card>
  standalone: true, // No NgModule needed (Angular 14+)
  imports: [CommonModule], // What this component's template uses
  templateUrl: "./user-card.component.html", // External template file
  // OR template: `...` for inline template
  styleUrl: "./user-card.component.css", // External style
  // OR styles: [`...`] for inline
})
export class UserCardComponent {
  user = { name: "Alice", email: "alice@example.com", role: "Admin" };
  isSelected = false;

  selectUser(): void {
    this.isSelected = !this.isSelected;
    console.log(`Selected: ${this.user.name}`);
  }
}
```

## Template Syntax Basics

```html
<!-- Interpolation: {{ expression }} — renders value as text -->
<h3>{{ user.name }}</h3>
<p>{{ user.role.toUpperCase() }}</p>

<!-- Property binding: [property]="expression" -->
<img [src]="user.avatarUrl" [alt]="user.name" />
<button [disabled]="!isSelected">Deselect</button>

<!-- Event binding: (event)="handler($event)" -->
<button (click)="selectUser()">Select</button>
<input (input)="onInput($event)" />

<!-- Conditional: @if (Angular 17+) or *ngIf -->
@if (isSelected) {
<span class="badge">Selected</span>
}

<!-- Loop: @for (Angular 17+) or *ngFor -->
@for (item of items; track item.id) {
<li>{{ item.name }}</li>
}
```

## Component Composition

```html
<!-- Parent template uses the child component as a custom tag -->
<div class="user-list">
  @for (user of users; track user.id) {
  <app-user-card [user]="user" (selected)="onUserSelected($event)" />
  }
</div>
```

## Common Mistake

Forgetting `standalone: true` and the required `imports` array — template directives like `*ngIf` and `*ngFor` won't work:

```typescript
// WRONG — standalone component using CommonModule without importing it
@Component({
  selector: 'app-list',
  standalone: true,
  // Missing imports: [CommonModule] !
  template: `<li *ngFor="let item of items">{{ item }}</li>`
  // Error: Can't bind to 'ngFor' since it isn't a known property of 'li'
})

// RIGHT
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],  // Provides *ngFor, *ngIf, etc.
  template: `<li *ngFor="let item of items">{{ item }}</li>`
})
```

## When to Reach For This

- Any UI element that appears more than once — extract to a component
- Any piece of UI that has its own state (loading, error, selection) — component
- Building a page — compose it from smaller components instead of one giant template
- When you want to test UI logic in isolation — standalone components are testable
- When applying Angular 17+ — prefer `@if` / `@for` over `*ngIf` / `*ngFor` for better type narrowing
