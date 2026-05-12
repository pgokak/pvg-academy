---
title: "Pipes"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```typescript
// Formatting logic scattered in components
@Component({ ... })
export class OrderListComponent {
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  // Same formatPrice duplicated in ProductComponent, CartComponent, InvoiceComponent...
}
```

Formatting logic copy-pasted into every component. Change the currency format → find every copy.

## Mental Model

A pipe is a formatting filter in your template. `{{ price | currency }}` — the pipe transforms the value before display. Components stay clean; formatting is reusable and declarative.

## Built-in Pipes

```html
<!-- Date formatting -->
{{ order.createdAt | date }} → "Jan 15, 2024" {{ order.createdAt |
date:'shortDate' }} → "1/15/24" {{ order.createdAt | date:'MMMM d, y' }} →
"January 15, 2024" {{ order.createdAt | date:'relative' }} → "3 days ago" (not
built-in, needs custom)

<!-- Currency -->
{{ price | currency }} → "$42.50" {{ price | currency:'EUR':'symbol':'1.2-2' }}
→ "€42.50" {{ price | currency:'GBP':'symbol':'1.0-0' }} → "£43"

<!-- String transforms -->
{{ name | uppercase }} → "ALICE SMITH" {{ name | lowercase }} → "alice smith" {{
name | titlecase }} → "Alice Smith"

<!-- Number -->
{{ 3.14159 | number:'1.2-2' }} → "3.14" (min 1 integer, 2 decimal places) {{
3.14159 | number:'1.0-0' }} → "3"

<!-- JSON (great for debugging) -->
<pre>{{ someObject | json }}</pre>

<!-- Slice -->
{{ [1,2,3,4,5] | slice:1:3 }} → [2, 3] {{ 'Hello World' | slice:0:5 }} → "Hello"

<!-- Async — subscribes to Observable or Promise -->
{{ users$ | async }} → renders when Observable emits
```

## Pipe Chaining

```html
<!-- Chain pipes left to right with | -->
{{ user.name | uppercase | slice:0:10 }} {{ price | currency | uppercase }} {{
date | date:'yyyy-MM-dd' | uppercase }}
```

## Custom Pipe

```typescript
// truncate.pipe.ts — truncate long strings with an ellipsis
@Pipe({
  name: "truncate",
  pure: true, // Only re-runs when input reference changes (default — good for performance)
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string,
    maxLength: number = 50,
    ellipsis: string = "...",
  ): string {
    if (!value) return "";
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + ellipsis;
  }
}

// Usage in template:
// {{ description | truncate }}              → first 50 chars
// {{ description | truncate:100 }}          → first 100 chars
// {{ description | truncate:20:'…' }}       → first 20 chars + "…"
```

## The async Pipe — Observables in Templates

```typescript
@Component({
  template: `
    <!-- async pipe: subscribes, renders values, unsubscribes on destroy -->
    @if (users$ | async; as users) {
      @for (user of users; track user.id) {
        <p>{{ user.name }}</p>
      }
    } @else {
      <p>Loading...</p>
    }
  `,
})
export class UsersComponent {
  // No subscribe() needed — async pipe handles it
  users$ = inject(UserService).getUsers();
}
```

## Common Mistake

Using `date` pipe without importing it in a standalone component — `date` is in CommonModule or can be imported directly:

```typescript
// WRONG — DatePipe not imported
@Component({
  standalone: true,
  imports: [],  // Missing DatePipe or CommonModule!
  template: `{{ order.date | date }}`  // Error: No pipe found with name 'date'
})

// RIGHT — import CommonModule (includes all built-in pipes)
@Component({
  standalone: true,
  imports: [CommonModule],  // Includes date, currency, uppercase, etc.
  template: `{{ order.date | date }}`
})

// OR import the specific pipe class
@Component({
  standalone: true,
  imports: [DatePipe, CurrencyPipe, TruncatePipe],
  template: `{{ order.date | date }}`
})
```

## When to Reach For This

- Any display formatting in templates — pipes keep transformation logic out of components
- Dates: always use `date` pipe — it respects locale settings
- Currency: always use `currency` pipe — handles locale, symbol, decimal places
- Reusable transformations (truncate, highlight, safe HTML) — custom pipes
- Observable data in templates — always use `async` pipe to auto-manage subscriptions
