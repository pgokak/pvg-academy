---
title: "Classes"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# Classes

## The Problem

Without encapsulation, internal state is public — anyone can break it:

```ts
// No class — just an object
const account = { owner: "Prashant", balance: 1000 };

account.balance = -99999; // ✅ TypeScript says fine — no protection
```

And there's no way to attach behavior (like `deposit`, `withdraw`) to the data in a way that enforces invariants.

---

## Mental Model

A class is a **blueprint for objects with built-in privacy controls**.

The blueprint says: "every BankAccount has an owner and a balance. The balance can only change through deposit/withdraw. Nobody outside this class touches balance directly."

TypeScript enforces those rules at compile time — the JavaScript output is standard ES2015 classes.

---

## Class Basics

```ts
class User {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet(): string {
    return `Hi, I'm ${this.name}`;
  }
}

const user = new User("Prashant", 32);
user.greet(); // "Hi, I'm Prashant"
```

---

## Access Modifiers

Control who can see and change what:

| Modifier           | Accessible from             |
| ------------------ | --------------------------- |
| `public` (default) | Anywhere                    |
| `private`          | Only inside this class body |
| `protected`        | This class and subclasses   |

```ts
class BankAccount {
  public owner: string;
  private balance: number;

  constructor(owner: string, initial: number) {
    this.owner = owner;
    this.balance = initial;
  }

  deposit(amount: number): void {
    this.balance += amount; // ✅ inside the class
  }
}

const acc = new BankAccount("Prashant", 1000);
acc.owner; // ✅ public
acc.balance; // ❌ private — TypeScript error
acc.deposit(500); // ✅ public method that modifies private state
```

---

## Constructor Shorthand

Declare and assign in one step — eliminates the repetition:

```ts
// ❌ Verbose — declare, then assign
class Point {
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// ✅ Shorthand — same result, less code
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
```

---

## `readonly`

Set once (in the constructor), never changed:

```ts
class Config {
  constructor(readonly appName: string) {}
}

const cfg = new Config("MyApp");
cfg.appName; // ✅ reading is fine
cfg.appName = "Other"; // ❌ cannot assign to readonly property
```

---

## `implements` — Fulfilling a Contract

Declare that a class satisfies an interface. TypeScript errors immediately if you miss anything:

```ts
interface Serializable {
  serialize(): string;
}

class UserRecord implements Serializable {
  constructor(
    private id: number,
    private name: string,
  ) {}

  serialize(): string {
    return JSON.stringify({ id: this.id, name: this.name });
  }
}
```

Delete `serialize()` and TypeScript tells you: "Class 'UserRecord' incorrectly implements interface 'Serializable'." The interface is the contract; the class is the implementation.

---

## `static` Members

Static members belong to the class itself, not to any instance:

```ts
class Counter {
  static count = 0;
  constructor() {
    Counter.count++;
  }
  static reset(): void {
    Counter.count = 0;
  }
}

new Counter();
new Counter();
Counter.count; // 2 — shared across all instances
Counter.reset();
Counter.count; // 0
```

---

## Side-by-Side: With vs Without Access Modifiers

```ts
// ❌ No protection — balance can be set to anything from outside
const account = { owner: "P", balance: 1000 };
account.balance = -Infinity; // TypeScript: fine

// ✅ Private balance — can only change through controlled methods
class Account {
  constructor(
    public owner: string,
    private balance: number,
  ) {}
  deposit(n: number) {
    this.balance += n;
  }
  getBalance() {
    return this.balance;
  }
}
const acc = new Account("P", 1000);
acc.balance = -Infinity; // ❌ TypeScript error
```

---

## Common Mistake

Assuming `private` provides runtime protection — it doesn't. It's compile-time only:

```ts
class Secret {
  private value = "hidden";
}

const s = new Secret();
(s as any).value; // "hidden" — accessible at runtime, TypeScript just can't see it
```

For true runtime privacy, use JavaScript's `#` private fields: `#value = "hidden"`.

---

## When to Reach For This

Use a class when you need **instances with shared methods**, **encapsulated private state**, or **something that implements an interface**. If you just need a shape (no behavior, no privacy), a `type` or `interface` is simpler. The detailed comparison is lesson 19.

---

## Key Takeaways

| Concept               | Example                                  |
| --------------------- | ---------------------------------------- |
| Constructor shorthand | `constructor(public name: string) {}`    |
| `private`             | Accessible only inside the class body    |
| `readonly`            | Set in constructor, never reassigned     |
| `implements`          | Declares the class fulfills an interface |
| `static`              | Belongs to the class, not to instances   |
| Runtime privacy       | Use `#field` for true JS private fields  |
