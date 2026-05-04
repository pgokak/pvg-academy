---
title: "Mapped Types"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 2.1"
since: 2016
stable: true
---

# Mapped Types

## The Problem

You know about `Partial<T>` and `Readonly<T>` from the utility types lesson. But how do they actually work? And how do you write your own type transformer?

```ts
// How does TypeScript turn this:
type User = { name: string; age: number };

// ...into this?
type PartialUser = { name?: string; age?: number };
```

Understanding mapped types answers that question — and lets you write transformations that no built-in utility covers.

---

## Mental Model

A mapped type is a **loop over the keys of a type**, transforming each one.

```ts
// For every key K in User, make its value type T[K] but optional
{ [K in keyof T]?: T[K] }
```

Read it like: "for every key K in T, create a property K with type T[K]." The `?` makes it optional. That's literally how `Partial` is implemented.

---

## The Syntax

```ts
type MyMapped<T> = {
  [K in keyof T]: T[K]; // same keys, same types — identity mapping
};
```

- `[K in keyof T]` — loop: K takes each key of T in turn
- `: T[K]` — the value type is whatever that key's type is

Modify the value type to transform the result:

```ts
// Make every property a string (regardless of original type)
type Stringified<T> = {
  [K in keyof T]: string;
};
```

---

## Building Your Own `Partial`

Add `?` after `]` to make every property optional:

```ts
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type User = { name: string; age: number };
type PartialUser = MyPartial<User>;
// { name?: string; age?: number }
```

---

## Building Your Own `Readonly`

Add `readonly` before `[`:

```ts
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

type FrozenUser = MyReadonly<User>;
// { readonly name: string; readonly age: number }
```

---

## Removing Modifiers with `-`

Add `-?` to remove optionality, `-readonly` to remove readonly:

```ts
type MyRequired<T> = {
  [K in keyof T]-?: T[K]; // -? strips the optional marker
};

type Mutable<T> = {
  -readonly [K in keyof T]: T[K]; // -readonly strips readonly
};
```

This is exactly how `Required<T>` is built.

---

## Building Your Own `Record`

Map over a set of keys to create an object type:

```ts
type MyRecord<K extends string, V> = {
  [Key in K]: V;
};

type RoleMap = MyRecord<"admin" | "viewer", string[]>;
// { admin: string[]; viewer: string[] }
```

---

## Value Transformation

You can transform the value type too — not just add/remove modifiers:

```ts
// Make every property nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type NullableUser = Nullable<User>;
// { name: string | null; age: number | null }
```

---

## Side-by-Side: Manual vs Mapped

```ts
type User = { name: string; age: number; email: string };

// ❌ Manual — 3 properties to update whenever User changes
type OptionalUser = { name?: string; age?: number; email?: string };

// ✅ Mapped — always in sync, scales to any size
type OptionalUser = { [K in keyof User]?: User[K] };
// Same as Partial<User>
```

---

## Common Mistake

Forgetting that mapped types only iterate `keyof T` — they can't add _new_ keys:

```ts
// ❌ Trying to add a key that doesn't exist on T
type WithId<T> = {
  [K in keyof T]: T[K];
  id: string;  // ❌ syntax error — can't mix mapped + non-mapped
};

// ✅ Use intersection to add extra properties
type WithId<T> = T & { id: string };
```

---

## When to Reach For This

Use mapped types when you need a transformation that no built-in utility covers: making every value nullable, adding a specific modifier to some keys, building a schema type from a data type. They're also the foundation for understanding how TypeScript's own utilities work.

---

## Key Takeaways

| Concept              | Example                              |
| -------------------- | ------------------------------------ |
| Basic mapped type    | `{ [K in keyof T]: T[K] }`           |
| Make optional        | `{ [K in keyof T]?: T[K] }`          |
| Make readonly        | `{ readonly [K in keyof T]: T[K] }`  |
| Remove optional      | `{ [K in keyof T]-?: T[K] }`         |
| Transform value type | `{ [K in keyof T]: T[K] \| null }`   |
| Can't add new keys   | Use intersection `T & { newKey: V }` |
