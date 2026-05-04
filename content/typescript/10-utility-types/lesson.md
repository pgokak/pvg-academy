---
title: "Utility Types"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 2.1"
since: 2016
stable: true
---

# Utility Types

## The Problem

You have a `User` type and need a version for updates — where every field is optional. So you rewrite it manually:

```ts
type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
};

// ❌ Manually duplicated — if User changes, you update this too, and forget one
type UserUpdate = {
  id?: number;
  name?: string;
  email?: string;
  role?: "admin" | "viewer";
};
```

Two definitions of the same shape. They'll drift. And this is just _one_ transformation — what about a version without `id`? A readonly version?

---

## Mental Model

Utility types are **type transformers** — you put a type in, you get a modified type out.

```
Partial<User>        →  all fields become optional
Omit<User, "id">     →  remove the id field
Pick<User, "name">   →  keep only the name field
```

You write the source type once. Utility types derive all variations from it automatically.

---

## `Partial<T>` — All Fields Optional

The classic use case: PATCH/update endpoints where you only send what changed:

```ts
type User = { id: number; name: string; email: string };

type UserUpdate = Partial<User>;
// { id?: number; name?: string; email?: string }

function updateUser(id: number, changes: Partial<User>): void { ... }
updateUser(1, { name: "New Name" }); // ✅ only send what changed
```

---

## `Required<T>` — All Fields Required

Opposite of `Partial`. Strips every `?` from optional fields:

```ts
type Config = { host?: string; port?: number };
type StrictConfig = Required<Config>;
// { host: string; port: number } — optional is gone
```

---

## `Pick<T, K>` — Keep Only Specific Keys

Creates a type with only the keys you name — useful when a function only needs part of a type:

```ts
type UserContact = Pick<User, "name" | "email">;
// { name: string; email: string }
```

It documents exactly what a function needs instead of forcing it to receive the full object.

---

## `Omit<T, K>` — Remove Specific Keys

Opposite of `Pick`. Creates a type without the keys you name:

```ts
type NewUser = Omit<User, "id">;
// { name: string; email: string; role: "admin" | "viewer" }
// — no id, because new users don't have one yet
```

---

## `Record<K, V>` — Object with Typed Keys and Values

Creates an object type where every key is type K and every value is type V:

```ts
type UsersByRole = Record<"admin" | "viewer", User[]>;
// { admin: User[]; viewer: User[] }

const roster: UsersByRole = { admin: [], viewer: [] };
```

---

## `ReturnType<F>` — Extract a Function's Return Type

Derive the return type without naming it separately — useful when you don't control the function:

```ts
function getUser() {
  return { id: 1, name: "Prashant", role: "admin" as const };
}

type UserShape = ReturnType<typeof getUser>;
// { id: number; name: string; role: "admin" }
```

---

## Side-by-Side: Manual vs Utility Type

```ts
type User = { id: number; name: string; email: string };

// ❌ Manual — duplicated, drifts when User changes
type UserUpdate = { id?: number; name?: string; email?: string };

// ✅ Derived — always in sync with User
type UserUpdate = Partial<User>;
```

---

## Common Mistake

Using `Partial` when you actually want `Pick`:

```ts
// ❌ Partial — still includes id and role as optional
type ContactForm = Partial<User>;
// { id?: number; name?: string; email?: string; role?: ... }
// Why does a contact form have id and role?

// ✅ Pick — only what the form actually needs
type ContactForm = Pick<User, "name" | "email">;
```

`Partial` makes _all_ fields optional. `Pick` _selects_ only the fields you want.

---

## When to Reach For This

CRUD operations are the clearest guide:

- **Create**: `Omit<T, "id">` — new records don't have an ID yet
- **Read**: full type
- **Update**: `Partial<T>` — send only changed fields
- **Display subset**: `Pick<T, "name" | "email">` — only what the UI needs

---

## Key Takeaways

| Utility Type    | What it does                      |
| --------------- | --------------------------------- |
| `Partial<T>`    | All properties optional           |
| `Required<T>`   | All properties required           |
| `Pick<T, K>`    | Keep only named keys              |
| `Omit<T, K>`    | Remove named keys                 |
| `Record<K, V>`  | Object with typed keys and values |
| `ReturnType<F>` | Extract a function's return type  |
| `Readonly<T>`   | Prevent property reassignment     |
