---
title: "Arrays and Tuples"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# Arrays and Tuples

## The Problem

A plain JavaScript array accepts anything — TypeScript can't help you with the values inside:

```ts
const items = [];
items.push("hello");
items.push(42); // mixed — intentional or a bug?
items.push(null); // probably a bug

const first = items[0];
first.toUpperCase(); // TypeScript can't check this — it has no idea what's in there
```

Without typing, every array access is a gamble. TypeScript locks down what goes in.

---

## Mental Model

- **`string[]`** = a box that only holds strings. Try to push a number and TypeScript errors immediately.
- **`[string, number]`** (tuple) = a fixed-size box where _each slot has its own type_. Position matters — slot 0 is always a string, slot 1 is always a number.

```
string[]          →  [ "a",   "b",   "c", ... ]  any length, all strings
[string, number]  →  [ "age", 32    ]             exactly 2 items, fixed types
```

---

## Typed Arrays

Two syntaxes — pick either, they're identical:

```ts
const names: string[] = ["Alice", "Bob", "Charlie"];
const scores: Array<number> = [95, 87, 100];
```

TypeScript tracks the element type through every operation:

```ts
names.push(42); // ❌ number not assignable to string
names[0].toUpperCase(); // ✅ TypeScript knows it's a string
names.filter((n) => n.startsWith("A")); // ✅ n inferred as string
```

---

## Array of Objects

```ts
interface User {
  name: string;
  age: number;
}

const users: User[] = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
];

users.map((u) => u.name); // ✅ u is User — autocomplete works
users.find((u) => u.age > 28); // ✅ returns User | undefined
```

---

## Tuples — Fixed-Length, Mixed Types

Use a tuple when **position has meaning**:

```ts
type Coordinate = [number, number]; // [latitude, longitude]
type NameAge = [string, number];

const location: Coordinate = [19.0, 72.8];
const me: NameAge = ["Prashant", 32];

// Destructuring — each position gets a meaningful name
const [lat, lng] = location;
const [name, age] = me;
```

---

## Real-World Tuple: React's `useState`

`useState` returns a tuple — that's why destructuring works so cleanly:

```ts
// useState returns: [T, Dispatch<SetStateAction<T>>]
const [count, setCount] = useState(0);
//     ^number  ^function — TypeScript knows both types from the tuple
```

Slot 0 is always the value, slot 1 is always the setter. Tuples make position meaningful and type-safe.

---

## Side-by-Side: Array vs Tuple

```ts
// Array — variable length, one type throughout
const tags: string[] = ["ts", "react"];
tags.push("node"); // ✅ grows freely

// Tuple — fixed structure, mixed types, position matters
const entry: [string, number] = ["score", 100];
entry[2] = "extra"; // ❌ index 2 doesn't exist in this tuple
```

---

## Common Mistake

Using a tuple when you actually need an array:

```ts
// ❌ Tuple — TypeScript enforces exactly 2 items
const ids: [number, number] = [1, 2];
ids.push(3); // TypeScript will error

// ✅ Array — grows freely
const ids: number[] = [1, 2];
ids.push(3); // perfectly fine
```

Use tuples for **fixed structure** (coordinates, `[value, setter]` pairs). Use arrays for **collections of unknown size**.

---

## When to Reach For This

- **Array** — any list of the same type of thing.
- **Tuple** — 2–3 values that belong together where position has meaning: coordinates, `[error, result]` patterns, or `useState`-style `[value, setter]` pairs.

---

## Key Takeaways

| Concept                 | Example                               |
| ----------------------- | ------------------------------------- |
| Typed array             | `string[]` or `Array<string>`         |
| Array of objects        | `User[]`                              |
| Tuple                   | `[string, number]`                    |
| Destructure tuple       | `const [name, age] = entry`           |
| Array → grows freely    | push, pop, splice all work            |
| Tuple → fixed structure | position has meaning, length is fixed |
