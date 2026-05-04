---
title: "Interfaces"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# Interfaces

## The Problem

Without a shared shape, you repeat yourself — and one typo creates a silent bug:

```ts
// Repeated everywhere — and one has a typo
function greetUser(user: { name: string; age: number }) { ... }
function saveUser(user: { name: string; age: numer }) { ... }  // typo — no error!
```

Every time the shape changes, you update it in every function. Miss one, and TypeScript can't catch it — there's no single source of truth.

---

## Mental Model

An interface is a **contract**.

It says: "any value claiming to be a `User` must have these exact properties with these exact types." Like a job description — you don't care who fills the role, as long as they meet the requirements.

```ts
interface User {
  name: string;
  age: number;
}
```

Define the contract once. Use it everywhere. Change it in one place and TypeScript flags every violation instantly.

---

## Defining and Using an Interface

```ts
interface User {
  name: string;
  age: number;
  email?: string; // ? means optional — may be absent
}

function greet(user: User): string {
  return `Hello, ${user.name}`;
}

greet({ name: "Prashant", age: 32 }); // ✅
greet({ name: "Prashant", age: 32, email: "p@g" }); // ✅ optional present
greet({ name: "Prashant" }); // ❌ missing required age
greet({ name: "Prashant", age: 32, city: "Mumbai" }); // ❌ excess property
```

---

## Extending Interfaces

Interfaces can build on each other with `extends`:

```ts
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// Dog needs BOTH fields
const dog: Dog = { name: "Bruno", breed: "Labrador" }; // ✅
const dog2: Dog = { name: "Bruno" }; // ❌ missing breed
```

This is the main reason to prefer `interface` over `type` when you expect the shape to grow — other interfaces can `extend` it cleanly.

---

## Readonly Properties

Mark a property `readonly` to prevent changes after assignment:

```ts
interface Config {
  readonly apiUrl: string;
  timeout: number;
}

const config: Config = { apiUrl: "https://api.example.com", timeout: 5000 };
config.timeout = 3000; // ✅ mutable
config.apiUrl = "other"; // ❌ cannot assign to readonly property
```

---

## Common Mistake

Expecting interfaces to exist at runtime — they don't. TypeScript erases them completely when it compiles to JavaScript:

```ts
interface User { name: string }

// ❌ This fails at runtime — User is not a class, it doesn't exist in JS
if (value instanceof User) { ... }

// ✅ Use a type guard instead
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "name" in value;
}
```

Interfaces are **compile-time only**. They produce zero JavaScript output.

---

## When to Reach For This

Use `interface` when describing the **shape of an object** — especially if that shape will be `extended` by other interfaces or `implemented` by a class. For unions, primitives, or function types, use `type` instead (covered in the Type Aliases lesson).

---

## Key Takeaways

| Concept                 | Example                                                         |
| ----------------------- | --------------------------------------------------------------- |
| Define interface        | `interface User { name: string }`                               |
| Optional property       | `email?: string`                                                |
| Readonly property       | `readonly id: number`                                           |
| Extend interface        | `interface Admin extends User { role: string }`                 |
| Runtime existence       | ❌ — interfaces are erased at compile time                      |
| Prefer `interface` when | Describing object shapes, especially ones that will be extended |
