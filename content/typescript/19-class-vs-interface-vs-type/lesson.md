---
title: "class vs interface vs type"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# class vs interface vs type

## The Problem

You're building a `User` concept. You could define it as:

```ts
class User { ... }
interface User { ... }
type User = { ... }
```

All three describe a user. All three give you type safety. So why do three options exist, and when do you pick each one?

---

## Mental Model

- **`class`** = a **blueprint that produces instances**. It has runtime existence, constructor logic, methods, and privacy controls. Lives in both TypeScript and JavaScript.
- **`interface`** = a **contract that describes a shape**. Compile-time only — erased to nothing. Other interfaces extend it; classes implement it.
- **`type`** = a **label for any type expression**. Also compile-time only. More flexible than interface but less structured.

The key question: do you need **runtime behavior** (methods, new instances, private fields)? If yes → class. If no → interface or type.

---

## The Same `User`, Three Ways

```ts
// As a class — you create instances, has runtime existence
class User {
  constructor(
    public name: string,
    public email: string,
  ) {}
  greet(): string {
    return `Hello, ${this.name}`;
  }
}
const user = new User("Prashant", "p@g.com"); // ✅ creates an instance

// As an interface — shape only, no runtime object
interface User {
  name: string;
  email: string;
}
const user: User = { name: "Prashant", email: "p@g.com" }; // plain object

// As a type — same as interface for this simple case
type User = {
  name: string;
  email: string;
};
const user: User = { name: "Prashant", email: "p@g.com" }; // plain object
```

---

## When to Use `class`

- You need to **create instances** (`new User(...)`)
- You need **private state** (encapsulated fields with access modifiers)
- You need **methods** that operate on the object's data
- You need to **implement an interface** (a class fulfills a contract)

```ts
class BankAccount {
  private balance: number;

  constructor(
    public owner: string,
    initial: number,
  ) {
    this.balance = initial;
  }

  deposit(n: number) {
    this.balance += n;
  }
  getBalance() {
    return this.balance;
  }
}

// Only a class gives you:
// - Private state that truly belongs to the object
// - Methods that are shared across all instances via the prototype
// - new BankAccount() to create instances
```

---

## When to Use `interface`

- Describing the **shape of a data object** (no behavior needed)
- Defining a **contract** that multiple implementations will fulfill
- When other interfaces or classes will **extend or implement** it
- When you need **declaration merging** to augment existing types

```ts
// Contract that any storage implementation must fulfill
interface UserRepository {
  findById(id: number): Promise<User>;
  save(user: User): Promise<void>;
}

class PostgresUserRepository implements UserRepository { ... }
class InMemoryUserRepository implements UserRepository { ... }
// Both fulfill the same contract — swap them without changing callers
```

---

## When to Use `type`

- Union types (`User | null`, `string | number`)
- Intersection compositions (`User & Admin`)
- Aliases for primitives (`type UserId = number`)
- Complex computed types (mapped types, conditional types)
- When you don't need declaration merging or class implementation

```ts
type UserOrAdmin = User | Admin; // union — can't do with interface
type FullUser = User & { role: string }; // intersection
type UserId = number; // primitive alias
type MaybeUser = User | null | undefined; // nullable
```

---

## The Decision Tree

```
Do you need to create instances with `new`?
  YES → class

Do you need private state or prototype methods?
  YES → class

Is this a contract that classes will implement?
  YES → interface

Will other interfaces extend this?
  YES → interface (cleaner syntax, merging support)

Is this a union, primitive alias, or complex type?
  YES → type

Otherwise:
  → interface (convention for plain object shapes)
```

---

## Side-by-Side: Repository Pattern

```ts
// interface — defines the contract (what it does)
interface UserRepository {
  find(id: number): User | undefined;
}

// class — implements the contract (how it does it)
class InMemoryUserRepository implements UserRepository {
  private users = new Map<number, User>();

  find(id: number): User | undefined {
    return this.users.get(id);
  }
}

// type — shapes the data that flows through
type User = { id: number; name: string; email: string };
```

Each tool playing its intended role: `interface` for the contract, `class` for the implementation, `type` for the data shape.

---

## Common Mistake

Using a `class` when you just need a type shape — it adds unnecessary bundle size and runtime overhead:

```ts
// ❌ Class just for typing — no instances, no behavior, no privacy needed
class UserDTO {
  name: string = "";
  email: string = "";
}
// This ships real JavaScript — a class definition in your bundle

// ✅ Type or interface — zero runtime cost
interface UserDTO {
  name: string;
  email: string;
}
type UserDTO = { name: string; email: string };
```

If you never call `new UserDTO()`, don't make it a class.

---

## Key Takeaways

|                      | `class`             | `interface`          | `type`                  |
| -------------------- | ------------------- | -------------------- | ----------------------- |
| Runtime existence    | ✅ JavaScript class | ❌ erased            | ❌ erased               |
| Create instances     | ✅ `new User()`     | ❌                   | ❌                      |
| Private state        | ✅ `private` fields | ❌                   | ❌                      |
| Implement a contract | ✅ `implements`     | defines the contract | ❌                      |
| Declaration merging  | ❌                  | ✅                   | ❌                      |
| Union types          | ❌                  | ❌                   | ✅                      |
| Default for shapes   | —                   | ✅ (convention)      | ✅ (for unions/complex) |
