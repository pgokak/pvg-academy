---
title: "type vs interface"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# type vs interface

## The Problem

You need to describe a `User` object shape. Should you use `type` or `interface`? Both seem to work:

```ts
type User = { name: string; age: number };
interface User {
  name: string;
  age: number;
}
```

They look the same. But they're not identical — and choosing the wrong one in the wrong situation causes real problems.

---

## Mental Model

- **`interface`** = a **contract**. Something that _other things can extend or implement_. Designed for object shapes in OOP-style code.
- **`type`** = a **label**. A name you stick on _any_ type expression — primitives, unions, intersections, functions. More flexible, less structured.

The confusion exists because for plain object shapes, they're almost identical. The differences show up at the edges.

---

## Where They're Identical

For plain object shapes, both work exactly the same:

```ts
type UserT = { name: string; age: number };
interface UserI {
  name: string;
  age: number;
}

// Both work for:
function greet(user: UserT): string {
  return user.name;
}
function greet(user: UserI): string {
  return user.name;
}

// Both can be extended (different syntax):
type AdminT = UserT & { role: string };
interface AdminI extends UserI {
  role: string;
}
```

---

## Where `interface` Wins

**1. Declaration merging** — two `interface` declarations with the same name _merge_:

```ts
interface Window {
  myPlugin: string;
} // adds to existing Window
interface Window {
  analytics: boolean;
} // also adds to Window
// Result: Window now has both — used by @types packages to augment built-ins

// ❌ type can't do this
type Window = { myPlugin: string };
type Window = { analytics: boolean }; // Error: Duplicate identifier
```

**2. `implements` by a class**:

```ts
interface Printable {
  print(): void;
}

class Report implements Printable {
  print() {
    console.log("printing...");
  }
}
// ✅ Classes implement interfaces — this is the designed use case
```

---

## Where `type` Wins

**1. Union types** — interface simply can't do this:

```ts
type Result = "ok" | "error";           // ✅
type ID = string | number;              // ✅
type MaybeUser = User | null;           // ✅

// ❌ interface can't represent a union
interface Result = "ok" | "error";      // Syntax error
```

**2. Primitive aliases**:

```ts
type UserId = number; // ✅
type Name = string; // ✅
// interface can only describe objects, not primitives
```

**3. Tuples and complex compositions**:

```ts
type Point = [number, number]; // ✅ tuple
type StringOrNum = string | number; // ✅ union
type Callback = (x: string) => void; // ✅ function type
```

---

## The Decision Table

| Situation                                        | Use                                       |
| ------------------------------------------------ | ----------------------------------------- |
| Plain object shape, used only as a type          | Either (prefer `interface` by convention) |
| Object shape that other interfaces will `extend` | `interface`                               |
| Object shape that a class will `implement`       | `interface`                               |
| Union type (`A \| B`)                            | `type`                                    |
| Primitive alias (`type ID = number`)             | `type`                                    |
| Tuple type                                       | `type`                                    |
| Function type                                    | `type`                                    |
| Augmenting a library's types (`declare module`)  | `interface` (uses merging)                |
| Complex intersections                            | `type` (cleaner with `&`)                 |

---

## Side-by-Side: 5 Real Scenarios

```ts
// ✅ Scenario 1: component props — interface (will be extended by other components)
interface ButtonProps { label: string; onClick(): void }
interface IconButtonProps extends ButtonProps { icon: string }

// ✅ Scenario 2: API response variants — type (it's a union)
type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string }

// ✅ Scenario 3: service contract — interface (a class will implement it)
interface UserRepository { findById(id: number): Promise<User> }
class PgUserRepository implements UserRepository { ... }

// ✅ Scenario 4: status codes — type (it's a union of literals)
type HttpStatus = 200 | 201 | 400 | 401 | 404 | 500

// ✅ Scenario 5: augmenting Express Request — interface (uses merging)
declare module "express" {
  interface Request { user?: User }  // adds to existing Request type
}
```

---

## Common Mistake

Using `type` for everything and losing the ability to do declaration merging — which matters when you need to augment library types:

```ts
// In a TypeScript project using Express, you can't add req.user this way:
type Request = { user?: User }; // ❌ doesn't augment Express's Request — it creates a new type

// You must use interface + module augmentation:
declare module "express" {
  interface Request {
    user?: User;
  } // ✅ merges into Express's existing Request
}
```

---

## When to Reach For This

**Default rule**: Use `interface` for object shapes you might extend or implement. Use `type` for anything else — unions, primitives, function types, complex compositions. When you can't decide, `interface` is the safer default for objects because it's more composable.

---

## Key Takeaways

| Feature               | `type`       | `interface`     |
| --------------------- | ------------ | --------------- |
| Object shape          | ✅           | ✅              |
| Union                 | ✅           | ❌              |
| Primitive alias       | ✅           | ❌              |
| `extends`             | ✅ (via `&`) | ✅ (cleaner)    |
| `implements` by class | ✅           | ✅ (preferred)  |
| Declaration merging   | ❌           | ✅              |
| Default for objects   | —            | ✅ (convention) |
