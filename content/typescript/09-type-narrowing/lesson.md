---
title: "Type Narrowing"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 2.0"
since: 2016
stable: true
---

# Type Narrowing

## The Problem

When a variable has a union type, TypeScript doesn't know _which_ branch you're in — so it only allows things that work for _all_ members:

```ts
function format(value: string | number): string {
  return value.toFixed(2); // ❌ string doesn't have .toFixed
}
```

You can't call `.toFixed()` because TypeScript protects you: `value` might be a string. You need to _prove_ which type it is first.

---

## Mental Model

Narrowing is **TypeScript following your runtime logic**.

When you write `if (typeof value === "number")`, TypeScript reads that condition and understands: "inside this if block, `value` is definitely a number." It narrows the type automatically based on your code.

You're not telling TypeScript to trust you — you're giving it evidence.

---

## `typeof` Guard

For primitives: `"string"`, `"number"`, `"boolean"`, `"undefined"`, `"object"`, `"function"`:

```ts
function format(value: string | number): string {
  if (typeof value === "number") {
    return value.toFixed(2); // ✅ narrowed to number
  }
  return value.toUpperCase(); // ✅ narrowed to string (only remaining option)
}
```

---

## `instanceof` Guard

For class instances:

```ts
function logError(err: Error | string): void {
  if (err instanceof Error) {
    console.log(err.message); // ✅ narrowed to Error
  } else {
    console.log(err); // ✅ narrowed to string
  }
}
```

---

## `in` Operator Guard

Checks whether a property exists on an object — great when you don't have a class to check against:

```ts
type Cat = { meow(): void };
type Dog = { bark(): void };

function makeSound(animal: Cat | Dog): void {
  if ("meow" in animal) {
    animal.meow(); // ✅ narrowed to Cat
  } else {
    animal.bark(); // ✅ narrowed to Dog
  }
}
```

---

## Discriminated Unions — The Most Powerful Pattern

Add a shared `kind` field with a literal type to each union member. TypeScript uses it to narrow automatically:

```ts
type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };
type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2; // ✅ narrowed to Circle
    case "rectangle":
      return shape.width * shape.height; // ✅ narrowed to Rectangle
  }
}
```

The real power: if you add a `Triangle` to `Shape` later and forget to add a `case`, TypeScript warns you. It's exhaustiveness checking for free.

---

## Type Predicates — Custom Narrowing Functions

A reusable narrowing function that tells TypeScript "if this returns true, the argument is type T":

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function process(value: unknown): void {
  if (isString(value)) {
    console.log(value.toUpperCase()); // ✅ narrowed to string
  }
}
```

`value is string` is the **type predicate** — without it, TypeScript treats the function as returning `boolean` and won't narrow.

---

## Side-by-Side: Without vs With Narrowing

```ts
// ❌ Without narrowing — TypeScript blocks you
function double(x: string | number) {
  return x * 2; // ❌ operator '*' cannot be applied to string | number
}

// ✅ With narrowing — TypeScript knows exactly what x is
function double(x: string | number) {
  if (typeof x === "number") return x * 2;
  return x + x; // string repetition
}
```

---

## Common Mistake

`typeof null === "object"` — a JavaScript legacy bug that trips up narrowing:

```ts
function process(value: string | null) {
  if (typeof value === "object") {
    // ❌ You think this catches null, but typeof null === "object" in JS!
    console.log(value.toUpperCase()); // crashes — value is null
  }
}

// ✅ Check for null directly
if (value !== null) {
  console.log(value.toUpperCase()); // safe
}
```

---

## When to Reach For This

Any time you have a union type and need to use something specific to one member of the union. `typeof` for primitives, `instanceof` for class instances, `in` for objects you only have the shape of, and discriminated unions when you control the type design.

---

## Key Takeaways

| Technique           | Use when                                         |
| ------------------- | ------------------------------------------------ |
| `typeof`            | Narrowing `string`, `number`, `boolean`          |
| `instanceof`        | Narrowing class instances                        |
| `in` operator       | Narrowing by property existence                  |
| Discriminated union | Union types with a shared `kind` / `type` field  |
| Type predicate      | Writing a reusable narrowing function (`x is T`) |
