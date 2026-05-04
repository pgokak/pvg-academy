---
title: "any vs unknown vs never"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 3.0 (unknown)"
since: 2018
stable: true
---

# any vs unknown vs never

## The Problem

Three types that look like they might mean the same thing — but they don't, and confusing them leads to either:

- **`any`**: false safety — you think you're fine, but TypeScript has stopped checking
- **`unknown`**: over-restriction — you have the right instinct but don't know how to use it
- **`never`**: confusion — what does "a type with no values" even mean?

---

## Mental Model

Think of the **type system as a set of possible values**:

- **`any`** = "I give up. TypeScript, stop checking." — it disables type checking entirely for this value
- **`unknown`** = "I don't know yet. TypeScript, keep checking — I'll narrow before I use it." — the safe alternative to `any`
- **`never`** = "This is impossible. No value should ever be here." — the bottom type, the set with zero members

---

## `any` — The Escape Hatch That Breaks Everything

`any` disables type checking. Any operation becomes legal:

```ts
let x: any = "hello";
x = 42; // ✅ fine
x = {}; // ✅ fine
x.foo.bar(); // ✅ no error — crashes at runtime
x(); // ✅ no error — crashes at runtime
```

**`any` is contagious** — anything derived from an `any` value also becomes `any`:

```ts
const data: any = fetch(...);
const name = data.user.name;  // name is any — you've lost type info downstream
```

---

## `unknown` — The Safe Alternative to `any`

`unknown` also accepts any value — but TypeScript forces you to narrow before you use it:

```ts
let x: unknown = "hello";
x.toUpperCase(); // ❌ Error: can't call methods on unknown

// ✅ Narrow first
if (typeof x === "string") {
  x.toUpperCase(); // ✅ narrowed to string
}
```

This is exactly what you want for things like JSON parsing, API responses, or function parameters that accept anything:

```ts
// ❌ any — TypeScript stops helping
function parse(input: any): User {
  return input; // no validation — just lies to TypeScript
}

// ✅ unknown — you're forced to validate
function parse(input: unknown): User {
  if (!isUser(input)) throw new Error("Invalid data");
  return input; // TypeScript knows it's User because of the guard
}
```

---

## `never` — The Impossible Type

`never` is the type for values that **can't exist**. A function that always throws has return type `never`. An unreachable branch has type `never`.

```ts
function fail(msg: string): never {
  throw new Error(msg);
  // doesn't return — never has a value
}

// In conditional types:
type NonNullable<T> = T extends null | undefined ? never : T;
//                                                 ^^^^^ "filter this out"
```

The most practical use: **exhaustive checks** (covered in lesson 15):

```ts
type Status = "on" | "off";
function check(s: Status): string {
  if (s === "on") return "running";
  if (s === "off") return "stopped";
  const _: never = s; // TypeScript errors if you add to Status and forget a branch
  return _;
}
```

---

## Side-by-Side: All Three

```ts
// any — no safety
let a: any = parseResponse();
a.user.name; // ✅ TypeScript: fine. Runtime: might crash.

// unknown — forced to check
let u: unknown = parseResponse();
u.user.name; // ❌ TypeScript: narrow first!
if (typeof u === "object" && u !== null && "user" in u) {
  // now u is narrowed — safe to access
}

// never — can't assign anything
let n: never;
n = "hello"; // ❌ string not assignable to never
n = 42; // ❌ number not assignable to never
// nothing is assignable to never — that's the point
```

---

## `unknown` vs `any` — The Critical Difference

```ts
function processAny(input: any): void {
  input.doSomething(); // ✅ TypeScript accepts it — you'll find out at runtime if it crashes
}

function processUnknown(input: unknown): void {
  input.doSomething(); // ❌ TypeScript refuses — you must narrow first

  if (typeof input === "object" && input !== null && "doSomething" in input) {
    (input as { doSomething(): void }).doSomething(); // ✅
  }
}
```

`unknown` is `any` with manners — it still accepts everything, but makes you prove you know what you're doing before you use it.

---

## When to Use Each

| Situation                                | Use                                                           |
| ---------------------------------------- | ------------------------------------------------------------- |
| External API response, JSON.parse result | `unknown`                                                     |
| Catching errors (`catch (e)`)            | `unknown` (TS 4.0+ default with `useUnknownInCatchVariables`) |
| Generic catch-all function parameter     | `unknown`                                                     |
| Migrating old JS to TS (temporary)       | `any` (with a plan to remove it)                              |
| Library type that genuinely has no shape | `any` (rare, document why)                                    |
| Unreachable code branches                | `never`                                                       |
| Exhaustive union checks                  | `never`                                                       |
| Functions that always throw              | `never` return type                                           |

---

## Common Mistake

Using `any` to handle `catch (e)`:

```ts
// ❌ e is any — .message might not exist at runtime
try { ... } catch (e: any) {
  console.log(e.message);
}

// ✅ e is unknown — check before accessing
try { ... } catch (e) {
  if (e instanceof Error) {
    console.log(e.message); // ✅ safe
  }
}
```

---

## Key Takeaways

| Type      | Accepts anything?             | Requires narrowing?          | Use for                                                     |
| --------- | ----------------------------- | ---------------------------- | ----------------------------------------------------------- |
| `any`     | ✅                            | ❌ (no checking)             | Temporary escape hatch, legacy migration                    |
| `unknown` | ✅                            | ✅ (must check before using) | API responses, JSON, catch blocks                           |
| `never`   | ❌ (nothing assignable to it) | N/A                          | Unreachable code, exhaustive checks, always-throw functions |
