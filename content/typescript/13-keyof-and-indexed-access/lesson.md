---
title: "keyof and Indexed Access"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 2.1"
since: 2016
stable: true
---

# keyof and Indexed Access

## The Problem

You want a function that reads a property from any object. How do you type the `key` parameter so TypeScript knows the key is valid — and knows what _type_ the value will be?

```ts
// ❌ key is just a string — TypeScript can't help
function get(obj: object, key: string) {
  return (obj as any)[key]; // forced to use any
}

const user = { name: "Prashant", age: 32 };
get(user, "naem"); // typo — no error
```

You lose all safety. TypeScript can't tell you "naem" doesn't exist.

---

## Mental Model

- **`keyof T`** = "the set of valid property names of T" — a union of string literal types
- **`T[K]`** = "the type of the value at property K on T" — TypeScript looks it up

```ts
type User = { name: string; age: number };

type UserKeys = keyof User; // "name" | "age"
type NameType = User["name"]; // string
type AgeType = User["age"]; // number
```

Think of `T[K]` like a dictionary lookup — you give TypeScript a type and a key, it gives you back the value's type.

---

## `keyof T`

```ts
type User = { name: string; age: number; email: string };

type UserKeys = keyof User; // "name" | "age" | "email"

function printKey(key: keyof User): void {
  console.log(key); // TypeScript knows key is one of those three strings
}

printKey("name"); // ✅
printKey("naem"); // ❌ not in the union
```

---

## Indexed Access `T[K]`

Get the type of a specific property:

```ts
type User = { name: string; age: number; active: boolean };

type NameType = User["name"]; // string
type AgeType = User["age"]; // number
type ActiveType = User["active"]; // boolean

// Works with union keys too
type StringOrNumber = User["name" | "age"]; // string | number
```

---

## Combining Them: Type-Safe Property Access

The real power — constrain `key` to actual keys of `obj`, and return the exact type of that property:

```ts
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Prashant", age: 32 };

const name = get(user, "name"); // type: string ✅
const age = get(user, "age"); // type: number ✅
get(user, "naem"); // ❌ "naem" not in keyof User
```

No `any`. TypeScript knows both that the key is valid _and_ what type the value is.

---

## `typeof` on Variables (Not Types)

TypeScript's `typeof` can extract the type of a variable and let you build from it:

```ts
const config = { host: "localhost", port: 3000 };

type Config = typeof config; // { host: string; port: number }
type ConfigKeys = keyof typeof config; // "host" | "port"
```

This is useful when you have a value you didn't explicitly type — `typeof` extracts the type, `keyof` gets its keys.

---

## Side-by-Side: Unsafe vs keyof-Safe

```ts
// ❌ Unsafe — key is just a string, return type is any
function pluck(obj: any, key: string): any {
  return obj[key];
}

// ✅ Safe — TypeScript validates key and knows the return type
function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Prashant", age: 32 };
const n = pluck(user, "name"); // string — autocomplete works, return type is right
```

---

## Common Mistake

Confusing `keyof T` (a _type_) with `Object.keys(obj)` (a _runtime value_):

```ts
const user = { name: "Prashant", age: 32 };

// Object.keys — runtime, returns string[] (TypeScript doesn't narrow it)
const keys = Object.keys(user); // string[] — NOT ("name" | "age")[]

// keyof — compile-time type only, never exists at runtime
type Keys = keyof typeof user; // "name" | "age" — type only
```

`keyof` is erased at compile time. Use `Object.keys()` when you need to iterate at runtime.

---

## When to Reach For This

Use `keyof T` when writing functions that accept a property name as a parameter. Use `T[K]` when you need the type of a specific property (often inside mapped types, which is the next lesson). Together they enable fully type-safe property access patterns.

---

## Key Takeaways

| Concept              | Example                                                    |
| -------------------- | ---------------------------------------------------------- |
| `keyof T`            | Union of property name types                               |
| `T[K]`               | Type of the value at key K                                 |
| Combined in function | `function get<T, K extends keyof T>(obj: T, key: K): T[K]` |
| `typeof variable`    | Extract type from a value                                  |
| Runtime equivalent   | `Object.keys(obj)` — but returns `string[]`, not the union |
