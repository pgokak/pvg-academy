---
title: "Functions"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# Functions

## The Problem

A function without type annotations is a black box — callers have to read the body to know what it accepts:

```ts
// JavaScript — anything goes in, anything comes out
function calculate(a, b, operation) {
  if (operation === "add") return a + b;
  if (operation === "multiply") return a * b;
  // forgot "subtract" — returns undefined silently
}

calculate("10", 5, "add"); // "105" — string + number, wrong result
calculate(10, 5, "divide"); // undefined — no error, just silent failure
```

With TypeScript, the contract is explicit. Callers and the function body are both checked.

---

## Mental Model

A function signature is a **promise to its callers**.

`function add(a: number, b: number): number` is a contract:

- **Callers** must pass two numbers
- **The body** must return a number

TypeScript holds both sides to that promise at compile time.

---

## Parameter and Return Types

```ts
function greet(name: string, age: number): string {
  return `Hello ${name}, you are ${age}`;
}

greet("Prashant", 32); // ✅
greet(32, "Prashant"); // ❌ arguments swapped — TypeScript catches it
greet("Prashant"); // ❌ missing required argument
```

---

## Optional and Default Parameters

```ts
// Optional — must come after required parameters
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}`;
}

greet("Prashant"); // "Hello, Prashant"
greet("Prashant", "Hey"); // "Hey, Prashant"

// Default — cleaner than optional when you always need a fallback
function repeat(text: string, times: number = 2): string {
  return text.repeat(times);
}

repeat("hi"); // "hihi"
repeat("hi", 3); // "hihihi"
```

---

## Function Types

A variable can hold a function — you describe that with a function type:

```ts
type Formatter = (value: number) => string;

const toEuro: Formatter = (v) => `€${v.toFixed(2)}`;
const toDollar: Formatter = (v) => `$${v.toFixed(2)}`;

// Useful for callback parameters:
function transform(numbers: number[], fn: (n: number) => number): number[] {
  return numbers.map(fn);
}
```

---

## `void` Return Type

Use `void` for functions that intentionally return nothing:

```ts
function log(message: string): void {
  console.log(message);
  // TypeScript errors if you accidentally return a value here
}
```

---

## Side-by-Side: Arrow vs Regular Function

Both are typed the same way:

```ts
// Regular
function add(a: number, b: number): number {
  return a + b;
}

// Arrow
const add = (a: number, b: number): number => a + b;
```

---

## Common Mistake

Skipping the return type annotation and getting an accidental `undefined` return:

```ts
// ❌ TypeScript infers return type as string | undefined — probably a bug
function getName(user: { name?: string }) {
  if (user.name) return user.name;
  // fell through without returning — returns undefined silently
}

// ✅ Annotating the return type forces you to handle every path
function getName(user: { name?: string }): string {
  if (user.name) return user.name;
  return "Anonymous"; // TypeScript now requires this branch
}
```

---

## When to Reach For This

Always annotate **parameters** — TypeScript can't infer them. Annotate **return types** on any function that's exported or used by multiple callers — it turns accidental `undefined` returns into a compile error.

---

## Key Takeaways

| Concept            | Example                          |
| ------------------ | -------------------------------- |
| Parameter type     | `function f(name: string)`       |
| Return type        | `function f(): string`           |
| Optional parameter | `name?: string`                  |
| Default parameter  | `name: string = "Guest"`         |
| Function type      | `type F = (x: number) => string` |
| No return value    | `: void`                         |
