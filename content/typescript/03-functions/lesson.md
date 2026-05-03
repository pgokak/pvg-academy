---
title: "Functions"
track: "typescript"
version: "TypeScript 5.x"
since: 2012
stable: true
---

## Typing Function Parameters and Return Types

A function without types is a bug waiting to happen. TypeScript lets you declare exactly what a function accepts and what it returns.

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

- `a: number` — first parameter must be a number
- `b: number` — second parameter must be a number
- `: number` after the parentheses — the return type

Try calling `add("hello", 2)` — TypeScript catches it immediately.

---

## Void Return Type

If a function doesn't return a value, annotate it with `void`:

```ts
function log(message: string): void {
  console.log(message);
}
```

`void` tells readers (and TypeScript) that the function's purpose is its **side effect**, not its return value.

---

## Optional Parameters

Add `?` to make a parameter optional. Optional parameters must come **after** required ones:

```ts
function greet(name: string, title?: string): string {
  if (title) {
    return `Hello, ${title} ${name}`;
  }
  return `Hello, ${name}`;
}

greet("Prashant"); // "Hello, Prashant"
greet("Prashant", "Dr."); // "Hello, Dr. Prashant"
```

Inside the function, TypeScript knows `title` is `string | undefined` — it forces you to check before using it.

---

## Default Parameters

Provide a fallback value instead of `?`:

```ts
function createSlug(text: string, separator: string = "-"): string {
  return text.toLowerCase().split(" ").join(separator);
}

createSlug("Hello World"); // "hello-world"
createSlug("Hello World", "_"); // "hello_world"
```

Default parameters don't need `?` — TypeScript infers they're optional from the default value.

---

## Arrow Functions

Arrow functions use the same type syntax:

```ts
const multiply = (a: number, b: number): number => a * b;
```

Or with a type annotation on the variable itself:

```ts
const multiply: (a: number, b: number) => number = (a, b) => a * b;
```

The second form is useful when you define a function type separately from its implementation.

---

## Functions as Parameters (Callbacks)

You can type callback functions precisely:

```ts
function applyToAll(numbers: number[], fn: (n: number) => number): number[] {
  return numbers.map(fn);
}

applyToAll([1, 2, 3], (n) => n * 2); // [2, 4, 6]
```

`fn: (n: number) => number` means: a function that takes a number and returns a number.

---

## Summary

- Annotate every parameter with a type
- Annotate the return type after the closing parenthesis
- Use `void` for functions that return nothing
- Use `?` for optional parameters (always after required ones)
- Use default values as an alternative to optional parameters
- Callback types use the `(param: Type) => ReturnType` syntax
