---
title: "Data Binding"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```javascript
// Manual DOM sync — 20 lines to keep UI and data in sync
const input = document.getElementById("search-input");
const counter = document.getElementById("counter");
const display = document.getElementById("search-display");

let searchText = "";
let count = 0;

// Update data when user types
input.addEventListener("input", (e) => {
  searchText = e.target.value;
  display.textContent = searchText; // Must update DOM manually
});

// Update DOM when count changes
function increment() {
  count++;
  counter.textContent = count; // Must remember to update every time
}
```

Every data change requires a manual DOM update. Miss one, and the UI is out of sync with the data.

## Mental Model

Data binding is a live wire between your class and your template. Change the class, the template updates. User interacts, the class knows. You never touch the DOM directly — Angular maintains the sync automatically.

## The Four Types of Binding

```
Class → Template (one-way out): Interpolation {{ }} and Property binding [ ]
Template → Class (one-way in): Event binding ( )
Class ↔ Template (two-way):     [(ngModel)] banana-in-a-box
```

## Interpolation — Display Values

```html
<!-- {{ expression }} — TypeScript expression as text in the template -->
<h1>{{ title }}</h1>
<p>Total: {{ items.length }} items</p>
<p>{{ user.name.toUpperCase() }}</p>
<p>{{ 2 + 2 }}</p>
<!-- 4 -->
<p>{{ isActive ? 'Active' : 'Inactive' }}</p>

<!-- Note: expressions must be simple — no assignments, no new, no loops -->
```

## Property Binding — Set DOM Properties

```html
<!-- [property]="expression" — sets a DOM property to a TypeScript value -->
<img [src]="user.avatarUrl" [alt]="user.name" />
<input [value]="searchText" />
<button [disabled]="form.invalid" [title]="tooltipText">Submit</button>
<div [style.color]="isError ? 'red' : 'black'">{{ message }}</div>
<div [style.width.px]="progressValue">Progress</div>

<!-- Attribute binding (for HTML attributes, not DOM properties) -->
<th [attr.colspan]="columnSpan">Header</th>
```

## Event Binding — React to User Actions

```html
<!-- (event)="handler($event)" — calls class method on DOM event -->
<button (click)="increment()">+1</button>
<input (input)="onInput($event)" (blur)="onBlur()" (keyup.enter)="onEnter()" />
<form (ngSubmit)="onSubmit()">...</form>
<div (mouseover)="highlight()" (mouseout)="unhighlight()">Hover me</div>
```

```typescript
// $event gives you the native DOM event
onInput(event: Event): void {
  this.searchText = (event.target as HTMLInputElement).value;
}
```

## Two-Way Binding — The Banana in a Box

```html
<!-- [(ngModel)] = property binding + event binding combined -->
<!-- Requires FormsModule -->
<input [(ngModel)]="searchText" />
<!-- Equivalent to: -->
<input [value]="searchText" (input)="searchText = $event.target.value" />
```

## Side-by-Side: All Four Types

```typescript
@Component({
  selector: "app-binding-demo",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- 1. Interpolation -->
    <p>Count: {{ count }}</p>

    <!-- 2. Property binding -->
    <button [disabled]="count >= 10">Can't go higher than 10</button>

    <!-- 3. Event binding -->
    <button (click)="increment()">Increment</button>
    <button (click)="decrement()">Decrement</button>

    <!-- 4. Two-way binding -->
    <input [(ngModel)]="name" placeholder="Enter your name" />
    <p>Hello, {{ name }}</p>
  `,
})
export class BindingDemoComponent {
  count = 0;
  name = "";

  increment(): void {
    if (this.count < 10) this.count++;
  }
  decrement(): void {
    if (this.count > 0) this.count--;
  }
}
```

## Common Mistake

Using `[value]` instead of `[(ngModel)]` for two-way binding — `[value]` is one-way (class → template only):

```html
<!-- WRONG: [value] only sets the input — typing doesn't update the class property -->
<input [value]="searchText" />
<!-- searchText never changes when user types -->

<!-- RIGHT: [(ngModel)] syncs in both directions -->
<input [(ngModel)]="searchText" />
<!-- searchText updates as user types; changing searchText updates the input -->
```

## When to Reach For This

- Display any class property in the template — interpolation `{{ }}`
- Bind to DOM properties (disabled, src, class) — property binding `[ ]`
- React to user events (click, input, submit) — event binding `( )`
- Simple form inputs that need two-way sync — `[(ngModel)]`
- Complex forms with validation — use Reactive Forms instead of `[(ngModel)]`
