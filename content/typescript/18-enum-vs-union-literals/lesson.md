---
title: "enum vs union literals"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# enum vs union literals

## The Problem

You need to represent a status: pending, active, inactive. You have two options:

```ts
// Option A: enum
enum Status {
  Pending = "pending",
  Active = "active",
  Inactive = "inactive",
}

// Option B: union literal
type Status = "pending" | "active" | "inactive";
```

Both give you type safety and autocomplete. Which should you use — and why?

---

## Mental Model

- **Enum** = a **runtime object** that maps names to values. It exists in your compiled JavaScript. You can iterate over it. It takes up bundle space.
- **Union literal** = a **compile-time constraint**. Pure TypeScript — completely erased. Zero bytes in your output.

The question is: do you need the runtime object, or just the type safety?

---

## What Enums Actually Compile To

```ts
enum Status {
  Pending = "pending",
  Active = "active",
}

// Compiles to:
var Status;
(function (Status) {
  Status["Pending"] = "pending";
  Status["Active"] = "active";
})(Status || (Status = {}));
```

That's real JavaScript that ships to your users. Union literals compile to nothing.

---

## Side-by-Side Comparison

```ts
// Enum
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

function move(dir: Direction): void {
  console.log(dir);
}
move(Direction.Up); // ✅
move("UP"); // ❌ string not assignable to Direction

// Union literal
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

function move(dir: Direction): void {
  console.log(dir);
}
move("UP"); // ✅ can pass the string directly
move("DIAGONAL"); // ❌ not in the union
```

Key difference: with enums you _must_ use `Direction.Up` — you can't pass the raw string `"UP"`. With union literals, you pass the string directly.

---

## When Enum Wins

**1. You need to iterate over all values at runtime**:

```ts
enum Permission {
  Read = "read",
  Write = "write",
  Admin = "admin",
}

// Can iterate at runtime:
const allPermissions = Object.values(Permission); // ["read", "write", "admin"]

// With union literals — you'd need a separate array:
type Permission = "read" | "write" | "admin";
const allPermissions = ["read", "write", "admin"] as const; // manual, can drift
```

**2. You want to group related constants with a shared namespace**:

```ts
enum HttpMethod {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Delete = "DELETE",
}

// HttpMethod.Get, HttpMethod.Post — clear grouping, autocomplete shows all options
```

---

## When Union Literal Wins

**1. Zero runtime cost** — the type is erased completely:

```ts
type Status = "pending" | "active" | "inactive";
// Compiles to: nothing
```

**2. You pass raw strings** — no need to import and use the enum name:

```ts
// With enum — callers must import and use the enum
import { Status } from "./status";
setStatus(Status.Active); // must use the enum name

// With union — pass the string directly
setStatus("active"); // ✅ cleaner for simple cases
```

**3. API/JSON responses** — when you receive strings from a server:

```ts
type Status = "pending" | "active"; // matches what the API sends exactly

const data = await fetchStatus(); // returns { status: "pending" }
// TypeScript validates it without any enum conversion needed
```

---

## The Decision Table

| Situation                                            | Use                                 |
| ---------------------------------------------------- | ----------------------------------- |
| Need to iterate all values at runtime                | Enum                                |
| Values come from an external API (strings in JSON)   | Union literal                       |
| Callers are internal — can import the enum           | Enum                                |
| Used in a public API or library                      | Union literal (no import needed)    |
| Simple flags or small sets of values                 | Union literal                       |
| Large group of related constants that grow over time | Enum                                |
| Zero bundle size impact required                     | Union literal                       |
| Using numeric values                                 | Enum (auto-increment is convenient) |

---

## Common Mistake: Numeric Enum + External API

```ts
// ❌ Dangerous — if you reorder members, stored values change
enum Priority {
  Low,
  Medium,
  High,
} // Low=0, Medium=1, High=2

// Stored in DB: 0, 1, 2
// You add "Critical":
enum Priority {
  Low,
  Critical,
  Medium,
  High,
} // now Medium=2 means Critical
// All your stored data is now wrong silently
```

Always use **string** enums or union literals for values that are stored or sent over the wire.

---

## When to Reach For This

**Default**: use union literals — simpler, no runtime cost, callers don't need to import. Switch to enums when you need runtime iteration, want a clear namespace for a large set of constants, or are working in a codebase that already uses enums consistently.

---

## Key Takeaways

|                    | Enum                      | Union Literal            |
| ------------------ | ------------------------- | ------------------------ |
| Runtime object     | ✅ exists in JS           | ❌ erased                |
| Pass raw string    | ❌ must use `Enum.Member` | ✅ pass string directly  |
| Iterate at runtime | ✅ `Object.values(Enum)`  | ❌ need a separate array |
| Bundle size        | small but non-zero        | zero                     |
| JSON / API values  | Use string enum           | ✅ natural fit           |
| Default choice     | for namespaced constants  | ✅ for simple cases      |
