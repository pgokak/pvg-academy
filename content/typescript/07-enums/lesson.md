---
title: "Enums"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# Enums

## The Problem

Without enums, you end up with magic strings scattered everywhere:

```ts
function handleOrder(status: string) {
  if (status === "pendng") { ... }  // typo — will silently never match
  if (status === "Shipped") { ... } // wrong case — same problem
}

handleOrder("pendingg"); // TypeScript: fine. Runtime: silent bug.
```

A plain `string` type is too wide — it accepts _any_ string. You want to restrict to _only_ valid values.

---

## Mental Model

An enum is a **named set of constants** — like a dropdown that only allows specific values.

```ts
enum OrderStatus {
  Pending = "pending",
  Shipped = "shipped",
  Delivered = "delivered",
}
```

Now `handleOrder(OrderStatus.Pendng)` is a compile error — the member doesn't exist. Typos become instant errors instead of silent runtime bugs.

---

## Numeric Enums

Members get auto-incrementing numbers starting at 0:

```ts
enum Direction {
  Up, // 0
  Down, // 1
  Left, // 2
  Right, // 3
}

const dir: Direction = Direction.Up;
console.log(dir); // 0
```

You can set the starting value:

```ts
enum Priority {
  Low = 1,
  Medium = 2,
  High = 3,
}
```

---

## String Enums

Each member gets an explicit string value — more readable in logs and JSON:

```ts
enum OrderStatus {
  Pending = "pending",
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
}

function notify(status: OrderStatus): string {
  return `Your order is: ${status}`; // "Your order is: shipped"
}
```

---

## Const Enums — Zero Runtime Cost

`const enum` inlines the values at compile time — no enum object is generated:

```ts
const enum Direction {
  Up = "UP",
  Down = "DOWN",
}

const d = Direction.Up;
// Compiled to: const d = "UP";  — the enum object is gone entirely
```

---

## Side-by-Side: Enum vs Union Literals

This is the real choice you'll face in practice:

```ts
// Enum — a runtime object, can be iterated
enum Status {
  Active = "active",
  Inactive = "inactive",
}
const s: Status = Status.Active;

// Union literal — compile-time only, zero runtime footprint
type Status = "active" | "inactive";
const s: Status = "active";
```

| Situation                                     | Choose               |
| --------------------------------------------- | -------------------- |
| Need to iterate over all values at runtime    | Enum                 |
| Values appear in JSON / external API          | String enum          |
| Just need type safety with no runtime cost    | Union literal        |
| Working in a codebase that already uses enums | Enum for consistency |

The detailed comparison is its own lesson (lesson 18).

---

## Common Mistake

Using a **numeric enum** for values that appear in external APIs or JSON:

```ts
enum Status {
  Active,
  Inactive,
} // Active=0, Inactive=1

// You reorder the members:
enum Status {
  Inactive,
  Active,
} // Now Active=1, Inactive=0 — values changed!
```

Any stored data that referenced the old numbers is now wrong. String enums don't have this problem — values are explicit and never shift.

---

## When to Reach For This

Use enums when you need a **named, iterable set of constants** that's referenced across many files and you want autocomplete + typo protection. If you just need the type-safety without runtime overhead, a union literal (`"pending" | "shipped"`) is simpler.

---

## Key Takeaways

| Concept            | Example                                                 |
| ------------------ | ------------------------------------------------------- |
| Numeric enum       | `enum Dir { Up, Down }` → 0, 1                          |
| Custom start value | `enum P { Low = 1, High = 3 }`                          |
| String enum        | `enum S { Active = "active" }`                          |
| Const enum         | `const enum E { A = "a" }` — inlined, no runtime object |
| Access value       | `Direction.Up`                                          |
| Alternative        | `type Status = "active" \| "inactive"`                  |
