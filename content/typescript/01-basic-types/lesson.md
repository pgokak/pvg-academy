---
title: "Basic Types"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.0"
since: 2012
stable: true
---

# Basic Types

## Why TypeScript?

JavaScript lets you do this — and it won't complain until it crashes at runtime:

```js
let age = 25;
age = "hello"; // JavaScript: fine
console.log(age + 1); // "hello1" — not what you wanted
```

TypeScript catches the mistake immediately, in your editor, before the code ever runs:

```ts
let age: number = 25;
age = "hello"; // ❌ Error: Type 'string' is not assignable to type 'number'
```

---

## The Four Primitive Types

```ts
let name: string = "Prashant";
let age: number = 32;
let isAdmin: boolean = true;
let score: null = null;
```

| Type        | Values                                           |
| ----------- | ------------------------------------------------ |
| `string`    | `"hello"`, `"world"`, template literals          |
| `number`    | `42`, `3.14`, `-7` (no separate int/float in JS) |
| `boolean`   | `true` or `false` only                           |
| `null`      | intentionally empty                              |
| `undefined` | declared but not assigned                        |

---

## Type Annotations on Functions

This is where TypeScript pays off most. You declare what goes in and what comes out:

```ts
function greet(name: string): string {
  return "Hello, " + name;
}

greet("Prashant"); // ✅ "Hello, Prashant"
greet(42); // ❌ Error: Argument of type 'number' is not assignable to 'string'
```

The `: string` after the parameter = what the function accepts.
The `: string` after the `)` = what the function returns.

---

## Type Inference — TypeScript Can Often Guess

You don't always need to write the type. TypeScript infers it from the value:

```ts
let city = "Mumbai"; // TypeScript infers: string
let count = 0; // TypeScript infers: number
let active = false; // TypeScript infers: boolean
```

**Rule of thumb:**

- Variables with an initial value → let TypeScript infer (no annotation needed)
- Function parameters and return types → always annotate explicitly

---

## Arrays and Objects

```ts
// Array of strings
let skills: string[] = ["TypeScript", "React", "Node.js"];

// Object with a specific shape
let user: { name: string; age: number } = {
  name: "Prashant",
  age: 32,
};
```

---

## The `any` Type — Avoid It

`any` turns off TypeScript completely for that variable. It defeats the purpose.

```ts
let data: any = "hello";
data = 42; // no error — TypeScript stops checking
data.foo.bar(); // no error — will crash at runtime
```

If you find yourself writing `any`, it usually means you haven't defined the type yet. Define it instead.

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
