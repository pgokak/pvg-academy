---
title: "Interfaces"
track: "typescript"
version: "TypeScript 5.x"
since: 2012
stable: true
---

## What Is an Interface?

In the previous lesson you learned how to type primitive values: `string`, `number`, `boolean`.

But real programs work with **objects** — users, products, orders. An `interface` lets you describe the exact shape of an object.

```ts
interface User {
  id: number;
  name: string;
  email: string;
}
```

Now TypeScript knows that every `User` must have those three fields. If you try to create a user without one, you get an error immediately — not at runtime, not in production.

---

## Using an Interface

Once defined, use it just like any other type:

```ts
const user: User = {
  id: 1,
  name: "Prashant",
  email: "prashant@example.com",
};
```

TypeScript checks:

- All required fields are present
- Every field has the correct type
- No extra fields with typos sneak in

---

## Optional Properties

Add `?` to make a field optional:

```ts
interface User {
  id: number;
  name: string;
  email: string;
  bio?: string; // optional — may or may not exist
}
```

TypeScript knows `bio` might be `undefined`, so it forces you to check before using it:

```ts
if (user.bio) {
  console.log(user.bio.toUpperCase()); // safe — TypeScript knows bio is a string here
}
```

---

## Readonly Properties

Use `readonly` to prevent a field from being changed after creation:

```ts
interface User {
  readonly id: number; // set once, never changed
  name: string;
}

const user: User = { id: 1, name: "Prashant" };
user.id = 2; // ❌ Error: cannot assign to 'id' because it is a read-only property
user.name = "Gokak"; // ✅ fine
```

---

## Interfaces as Function Parameters

The most common use: describe what a function expects.

```ts
interface Product {
  name: string;
  price: number;
  inStock: boolean;
}

function printProduct(product: Product): void {
  console.log(`${product.name} — ₹${product.price}`);
}
```

Any object that matches the shape works — TypeScript uses **structural typing** (the shape matters, not the name).

---

## Interface vs Type Alias

You will see both in TypeScript codebases:

```ts
interface User {
  name: string;
} // interface
type User = { name: string }; // type alias
```

For objects, prefer `interface` — it gives better error messages and supports `extends` (covered in a later lesson). Use `type` for unions, primitives, and complex combinations.

---

## Summary

- `interface` describes the shape of an object
- All fields are required unless marked `?`
- `readonly` prevents reassignment
- TypeScript checks every object against its interface at compile time
- Interfaces are the primary way to document and enforce data contracts in your code
