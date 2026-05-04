---
title: "Basic Types"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# Basic Types

## The Problem

JavaScript never complains about this — until it crashes at runtime:

```js
// JavaScript
let age = 25;
age = "hello"; // totally fine to JS
console.log(age + 1); // "hello1" — not what you wanted
```

You find out something is wrong only after it ships. TypeScript catches it immediately, in your editor, before the code runs.

---

## Mental Model

Think of TypeScript as a **spellchecker for types**.

A spellchecker doesn't stop you from writing — it just underlines mistakes as you type so you fix them before sending. TypeScript does the same for your data shapes: it watches what goes in and out of every variable and function, and red-underlines mismatches the moment you make them.

---

## The Four Primitive Types

```ts
let name: string = "Prashant";
let age: number = 32;
let isAdmin: boolean = true;
let nothing: null = null;
```

| Type        | Values                                     |
| ----------- | ------------------------------------------ |
| `string`    | `"hello"`, `"world"`, template literals    |
| `number`    | `42`, `3.14`, `-7` — no separate int/float |
| `boolean`   | `true` or `false` only                     |
| `null`      | intentionally empty                        |
| `undefined` | declared but not yet assigned              |

---

## Type Inference — You Don't Always Have to Write the Type

TypeScript can figure out the type from the value you assign:

```ts
let city = "Mumbai"; // TypeScript infers: string
let count = 0; // TypeScript infers: number
let active = false; // TypeScript infers: boolean
```

You only need to write the annotation explicitly when TypeScript can't infer — most commonly, function parameters:

```ts
function greet(name: string): string {
  return "Hello, " + name;
}
```

**Rule of thumb:** variables with initial values → let TypeScript infer. Function parameters and return types → annotate explicitly.

---

## The `any` Type — The Escape Hatch You Should Rarely Use

`any` tells TypeScript "stop checking this variable entirely":

```ts
let data: any = "hello";
data = 42; // no error
data.foo.bar(); // no error — will crash at runtime
```

It defeats the purpose of using TypeScript. When you reach for `any`, it usually means you haven't defined the type yet — define it instead.

---

## Common Mistake

Using `any` to silence an error:

```ts
// ❌ Don't do this
function process(input: any) { ... }

// ✅ Do this
function process(input: string) { ... }
```

The error TypeScript shows you is information. Silencing it with `any` is like turning off the spellchecker instead of fixing the spelling.

---

## When to Reach For This

Every time you write a variable or function in TypeScript — basic types are the foundation everything else builds on. Start here before learning interfaces, generics, or utility types.

---

## Key Takeaways

| Concept                 | Example                               |
| ----------------------- | ------------------------------------- |
| Type annotation         | `let name: string`                    |
| Function parameter type | `function greet(name: string)`        |
| Function return type    | `function greet(): string`            |
| Type inference          | `let age = 32` — no annotation needed |
| Array type              | `string[]` or `Array<string>`         |
| Avoid                   | `any` — turns off type checking       |
