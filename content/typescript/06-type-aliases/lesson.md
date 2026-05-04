---
title: "Type Aliases"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# Type Aliases

## The Problem

You've defined a shape inline — now you need it in three more places:

```ts
function distance(a: { x: number; y: number }, b: { x: number; y: number }): number { ... }
function midpoint(a: { x: number; y: number }, b: { x: number; y: number }): { x: number; y: number } { ... }
```

It's verbose, inconsistent, and one wrong character creates a mismatch TypeScript can't detect across different function signatures.

---

## Mental Model

A type alias is a **label you stick on any type expression** — primitives, unions, objects, functions, or complex combinations.

```ts
type Point = { x: number; y: number };
```

Now `Point` _is_ that type. You write it once and reference it by name anywhere.

---

## What You Can Alias

```ts
// Primitive
type UserId = number;

// Union
type Status = "active" | "inactive" | "pending";

// Object shape
type Point = { x: number; y: number };

// Function signature
type Callback = (err: Error | null, result: string) => void;

// Intersection — combine two shapes
type Admin = User & { role: "admin" };
```

---

## Intersection with `&`

Combine two shapes into one:

```ts
type HasId = { id: number };
type HasName = { name: string };

type User = HasId & HasName;
// Equivalent to: { id: number; name: string }

const user: User = { id: 1, name: "Prashant" }; // ✅ needs both fields
```

---

## Side-by-Side: `type` vs `interface`

This is the most common confusion in TypeScript. They overlap a lot, but the differences matter:

```ts
// interface — can extend, can merge
interface User {
  name: string;
}
interface Admin extends User {
  role: string;
} // ✅ clean extension

// type — can alias anything, including unions
type Status = "active" | "inactive"; // ✅ interface can't do this
type UserId = number; // ✅ interface can't do this
type Admin = User & { role: string }; // ✅ same result, different syntax
```

| Need                                     | Use                                                  |
| ---------------------------------------- | ---------------------------------------------------- |
| Object shape that others will extend     | `interface`                                          |
| Object shape that a class will implement | `interface`                                          |
| Union of types                           | `type`                                               |
| Alias for a primitive                    | `type`                                               |
| Function signature as a type             | `type`                                               |
| Combining two shapes                     | Either (`type` with `&`, `interface` with `extends`) |

**Rule of thumb**: when in doubt, reach for `interface` for object shapes and `type` for everything else.

---

## Common Mistake

Using `type` for everything and missing out on declaration merging — a feature exclusive to interfaces:

```ts
// interface — two declarations merge into one (useful for extending library types)
interface Window {
  myProp: string;
}
interface Window {
  myOtherProp: number;
}
// Result: Window now has both — this is how @types packages work

// type — two declarations = error
type Window = { myProp: string };
type Window = { myOtherProp: number }; // ❌ Duplicate identifier
```

---

## When to Reach For This

Reach for `type` when you need to name a **union**, a **primitive alias**, a **function signature**, or a complex **intersection**. For plain object shapes you expect others to extend, `interface` is cleaner. The detailed comparison is its own lesson (lesson 16).

---

## Key Takeaways

| Concept          | Example                                  |
| ---------------- | ---------------------------------------- |
| Primitive alias  | `type UserId = number`                   |
| Union alias      | `type Status = "on" \| "off"`            |
| Object shape     | `type Point = { x: number; y: number }`  |
| Intersection     | `type Admin = User & { role: string }`   |
| `type` wins      | Unions, primitives, function signatures  |
| `interface` wins | Extends, implements, declaration merging |
