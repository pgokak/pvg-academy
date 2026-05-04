---
title: "Modules"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 1.5"
since: 2015
stable: true
---

# Modules

## The Problem

Without modules, everything is global — names collide and you have no idea what depends on what:

```ts
// script.ts (no imports/exports)
function format(x: number) {
  return x.toFixed(2);
}
// utils.ts also has a `format` function — which one wins? Undefined behavior.
```

And when you have 50 helper functions in one file, the whole file loads even when you only need one function.

---

## Mental Model

A module is a **file with its own private scope**. Nothing inside leaks out unless you explicitly `export` it. Imports are explicit dependencies — you know exactly where every name comes from.

**A file becomes a module** the moment it has a top-level `import` or `export`. Without either, it's a script with global scope.

---

## Named Exports

Export as many things as you like, each with its own name:

```ts
// math.ts
export const PI = 3.14159;

export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}
```

Import using braces — you must use the exact name:

```ts
// app.ts
import { add, PI } from "./math";

console.log(add(2, 3)); // 5
console.log(PI); // 3.14159
```

---

## Default Exports

One per file — no name required at the import site:

```ts
// logger.ts
export default function log(message: string): void {
  console.log(`[LOG] ${message}`);
}
```

```ts
// app.ts
import log from "./logger"; // caller names it whatever they want
import logger from "./logger"; // also valid — same thing
```

---

## Side-by-Side: Named vs Default

```ts
// Named — explicit, refactoring-safe
export function add(a: number, b: number): number { ... }
import { add } from "./math"; // must use the exact name "add"

// Default — flexible naming, but easy to use inconsistently
export default function add(a: number, b: number): number { ... }
import add from "./math";      // could be: import sum from "./math" — same thing
import myAdd from "./math";    // also valid — now it's called myAdd
```

**Prefer named exports** — they're explicit, renaming is tracked by TypeScript, and they work better with tree-shaking.

---

## Re-exports (Barrel Files)

An `index.ts` that re-exports from multiple modules — callers import from one place:

```ts
// utils/index.ts
export { add, multiply, PI } from "./math";
export { formatDate } from "./dates";
export type { User } from "./types";
```

```ts
// Instead of three imports...
import { add } from "./utils/math";
import { formatDate } from "./utils/dates";

// ...one import
import { add, formatDate } from "./utils";
```

---

## `import type` — Type-Only Import

When you only need a type (not a runtime value), `import type` tells TypeScript to erase it completely at compile time:

```ts
import type { User } from "./types";

function greet(user: User): string {
  return `Hello, ${user.name}`;
}
```

Zero runtime footprint. No circular dependency risk. Enforced by `verbatimModuleSyntax` in modern TypeScript projects.

```ts
import type { User } from "./types";
const u: User = {}; // ✅ used as a type
new User(); // ❌ error — can't use a type-only import as a value
```

---

## Declaration Files (`.d.ts`)

`.d.ts` files contain **type declarations only — no JavaScript**. They describe the shape of:

- A JavaScript library that has no TypeScript source
- Compiled `.js` output you want to add types for

```ts
// legacy-lib.d.ts
declare function legacyCalc(a: number, b: number): number;
declare const VERSION: string;
```

When you `npm install @types/lodash`, you're getting `.d.ts` files. The runtime code is the real lodash JS — TypeScript reads `.d.ts` for types only.

---

## Common Mistake

Default exports are renamed freely at the import site — this creates inconsistency across a codebase:

```ts
// In three different files:
import Button from "./Button"; // file A
import Btn from "./Button"; // file B — same thing, different name
import MyButton from "./Button"; // file C — same thing, another name
```

Named exports prevent this: `import { Button }` must be `Button` everywhere.

---

## When to Reach For This

Always — every file in a modern TypeScript project should be a module (have at least one `export`). Use `import type` for type-only imports. Use barrel files (`index.ts`) to simplify import paths across feature boundaries.

---

## Key Takeaways

| Concept          | Example                                  |
| ---------------- | ---------------------------------------- |
| Named export     | `export function add() {}`               |
| Named import     | `import { add } from "./math"`           |
| Default export   | `export default class App {}`            |
| Default import   | `import App from "./App"`                |
| Re-export        | `export { add } from "./math"`           |
| Type-only import | `import type { User } from "./types"`    |
| Declaration file | `lib.d.ts` — types only, no runtime code |
