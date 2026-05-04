---
title: "Generics"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# Generics

## The Problem

You want a function that returns the first item of any array. Without generics, you face a bad choice:

```ts
// Option 1: hard-code string — only works for string arrays
function first(arr: string[]): string {
  return arr[0];
}

// Option 2: use any — works, but throws away all type info
function first(arr: any[]): any {
  return arr[0];
}

const name = first(["Alice", "Bob"]);
name.toUpperCase(); // TypeScript: ¯\_(ツ)_/¯ — name is `any`, no help
```

`any` silences TypeScript. You lose autocomplete, you lose error checking, you lose safety.

---

## Mental Model

A generic is a **function template with a "fill in the type later" slot**.

`<T>` is the slot. When you call `first(["Alice", "Bob"])`, TypeScript fills `T = string`. The return type becomes `string` automatically — no `any` needed.

```ts
function first<T>(arr: T[]): T {
  return arr[0];
}

const name = first(["Alice", "Bob"]); // T = string → returns string ✅
const num = first([1, 2, 3]); // T = number → returns number ✅
```

TypeScript infers what `T` is from what you pass in. You rarely need to write it explicitly.

---

## Generic Functions

The type parameter can appear anywhere in the signature:

```ts
function wrap<T>(value: T): { value: T } {
  return { value };
}

const a = wrap("hello"); // { value: string }
const b = wrap(42); // { value: number }
```

---

## Multiple Type Parameters

```ts
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const entry = pair("name", "Prashant"); // [string, string]
const entry2 = pair(1, true); // [number, boolean]
```

---

## Constraints with `extends`

Sometimes T must have certain properties. Use `extends` to constrain what T can be:

```ts
// T must be an object — Object.keys doesn't work on primitives
function getKeys<T extends object>(obj: T): string[] {
  return Object.keys(obj);
}

getKeys({ a: 1, b: 2 }); // ✅
getKeys("hello"); // ❌ string is not assignable to object

// T must have a .length — works for strings, arrays, anything with length
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
```

---

## Generic Interfaces

```ts
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<{ id: number; name: string }>;
type ListResponse = ApiResponse<string[]>;
```

One interface describes any API response — you slot in the data type.

---

## Side-by-Side: `any` vs Generic

```ts
// ❌ any — type info is lost
function identity(value: any): any {
  return value;
}
const x = identity("hello");
x.toFixed(); // no error at compile time — crashes at runtime

// ✅ generic — type info is preserved
function identity<T>(value: T): T {
  return value;
}
const x = identity("hello");
x.toFixed(); // ❌ TypeScript catches it: string doesn't have .toFixed
```

---

## Common Mistake

Over-constraining with `extends` when you don't need to:

```ts
// ❌ Unnecessary constraint — T doesn't need to be an object here
function wrap<T extends object>(value: T): { value: T } {
  return { value };
}
wrap("hello"); // ❌ string not assignable to object — but why?

// ✅ No constraint needed — wrap works for any type
function wrap<T>(value: T): { value: T } {
  return { value };
}
```

Only constrain when the function body actually _requires_ specific properties on T.

---

## When to Reach For This

Use generics when you're writing a function, class, or interface that works the same way regardless of the specific type — but you still want TypeScript to track what type flows through. Classic cases: collection operations (`first`, `last`, `filter`), wrappers (`wrap`, `cache`), API response types.

---

## Key Takeaways

| Concept           | Example                                           |
| ----------------- | ------------------------------------------------- |
| Type parameter    | `function f<T>(x: T): T`                          |
| Inferred on call  | `first([1,2,3])` → T inferred as number           |
| Multiple params   | `function pair<K, V>(k: K, v: V)`                 |
| Constraint        | `<T extends object>` — T must be an object        |
| Generic interface | `interface Box<T> { value: T }`                   |
| Why not `any`     | Generics preserve type info; `any` throws it away |
