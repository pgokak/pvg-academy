---
title: "Union Types"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# Union Types

## The Problem

Real-world values aren't always a single type. A function that formats a value should handle both strings and numbers — but how do you type that without using `any`?

```ts
// ❌ any — TypeScript stops helping entirely
function format(value: any): string {
  return String(value);
}

// What does this function actually accept?
// A string? A number? An object? We have no idea.
```

`any` silences TypeScript instead of describing reality. Union types describe reality.

---

## Mental Model

A union type is **"or"** in the type system.

`string | number` means: "this value is either a string OR a number — nothing else."

```ts
let id: string | number;
id = "abc-123"; // ✅ string
id = 42; // ✅ number
id = true; // ❌ boolean — not in the union
```

TypeScript knows the value is _one of_ those types. But to use type-specific methods, you have to prove _which one_ — that's narrowing.

---

## Narrowing a Union

TypeScript won't let you call `.toUpperCase()` on a `string | number` — it might be a number:

```ts
function format(value: string | number): string {
  return value.toUpperCase(); // ❌ number doesn't have .toUpperCase
}
```

You narrow it first:

```ts
function format(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase(); // ✅ narrowed to string
  }
  return value.toFixed(2); // ✅ narrowed to number
}
```

Inside each branch, TypeScript _knows_ exactly which type you're working with.

---

## String Literal Unions

Instead of `string`, you can restrict to specific string values:

```ts
type Direction = "north" | "south" | "east" | "west";

function move(dir: Direction): void { ... }

move("north");   // ✅
move("up");      // ❌ "up" is not in the union
```

This is often more useful than a plain `string` — it's self-documenting and catches typos.

---

## Union with `null` or `undefined`

With `strict` mode enabled, TypeScript won't let you use a value that might be `null` without checking:

```ts
function greet(name: string | null): string {
  return name.toUpperCase(); // ❌ name might be null

  // ✅ check first
  if (name === null) return "Hello, stranger";
  return name.toUpperCase();
}
```

---

## Side-by-Side: `any` vs Union

```ts
// ❌ any — no type safety at all
function stringify(value: any): string {
  return value.toFixed(2); // no error — crashes if value is a string
}

// ✅ union — TypeScript forces you to handle both cases
function stringify(value: string | number): string {
  if (typeof value === "number") return value.toFixed(2);
  return value;
}
```

---

## Common Mistake

Forgetting to narrow before using a union — TypeScript will only let you use properties _shared_ by all members:

```ts
function process(value: string | number) {
  // ✅ Works — toString() exists on both string and number
  console.log(value.toString());

  // ❌ Fails — .toFixed() only exists on number
  console.log(value.toFixed(2));
}
```

If you want to use something specific to one type, narrow first.

---

## When to Reach For This

Use a union type whenever a value can legitimately be more than one type: an ID that could be a string or number, a result that could be a value or null, a status field with specific valid strings. Always prefer a union over `any` — it gives TypeScript enough information to help you.

---

## Key Takeaways

| Concept           | Example                                                 |
| ----------------- | ------------------------------------------------------- |
| Union type        | `string \| number`                                      |
| Literal union     | `"north" \| "south" \| "east"`                          |
| Nullable          | `string \| null`                                        |
| Narrowing         | `if (typeof x === "string")`                            |
| Shared properties | Only members shared by all types work without narrowing |
| Prefer over `any` | Union describes reality; `any` hides it                 |
