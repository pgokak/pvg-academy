---
title: "never, as, and satisfies"
track: "typescript"
version: "TypeScript 5.x"
introduced: "TypeScript 4.9 (satisfies)"
since: 2022
stable: true
---

# never, as, and satisfies

## The Problem

Three patterns come up in real codebases that don't fit neatly into other lessons:

1. You have a `switch` on a union — how do you make TypeScript tell you when you forgot a case?
2. You need to tell TypeScript "I know better than you" about a type — but safely.
3. You want TypeScript to verify an object matches a type, but still keep the literal types.

These are the "escape hatch" tools — each one solves a specific problem.

---

## `never` — The Impossible Type

`never` is the type for values that should **never exist**. A function that always throws returns `never`. A branch that should be unreachable is typed `never`.

```ts
function fail(message: string): never {
  throw new Error(message);
  // no return — this function never completes normally
}
```

---

## `never` for Exhaustive Checks

The killer use case: force TypeScript to tell you when you've missed a union member in a switch:

```ts
type Shape = "circle" | "rectangle" | "triangle";

function area(shape: Shape): number {
  switch (shape) {
    case "circle":
      return 1;
    case "rectangle":
      return 2;
    // ❌ forgot "triangle" — let's catch that
    default:
      const _: never = shape; // ❌ Error: string is not assignable to never
      return _;
  }
}
```

When all cases are handled, `default` is unreachable and `shape` is `never`. If you add a new shape to the union and forget the case, TypeScript tells you immediately — at the `default` line.

---

## `as` — Type Assertion

Tell TypeScript "treat this value as type X" — useful when you know more than TypeScript can infer:

```ts
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// TypeScript infers: HTMLElement | null
// You know: it's definitely an HTMLCanvasElement

const ctx = canvas.getContext("2d");
```

`as` is a compile-time instruction — it doesn't add a runtime check.

---

## Side-by-Side: Safe vs Dangerous `as`

```ts
// ✅ Safe — you know the DOM element is a canvas (it's in your HTML)
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

// ❌ Dangerous — forcing a completely unrelated type
const num = "hello" as unknown as number;
num.toFixed(2); // no TypeScript error, crashes at runtime
```

`as` should be your last resort. Before using it, ask: "why doesn't TypeScript know this?" Usually the answer is to restructure the code so TypeScript can infer it — a type guard, a narrowing check, or a better function signature.

---

## `satisfies` — Validate Without Widening (TypeScript 4.9+)

`satisfies` checks that a value matches a type, but **keeps the narrower inferred type**:

```ts
type Config = { host: string; port: number | string };

// ❌ With `as` — port becomes number | string, you lose the literal
const config = { host: "localhost", port: 3000 } as Config;
config.port.toFixed(); // ❌ TypeScript sees number | string — .toFixed might not exist

// ✅ With `satisfies` — validated against Config, but TypeScript keeps port as number
const config = { host: "localhost", port: 3000 } satisfies Config;
config.port.toFixed(); // ✅ TypeScript knows port is number, not number | string
```

`satisfies` gives you the type-checking of an annotation without losing the precision of inference.

---

## Side-by-Side: annotation vs `as` vs `satisfies`

```ts
type Palette = Record<string, string>;
const colors = { red: "#FF0000", green: "#00FF00" };

// Type annotation — widened to Record<string, string>
const c1: Palette = colors;
c1.red; // string — fine
c1.red.toUpperCase(); // ✅

// satisfies — validated against Palette, keys still known
const c2 = colors satisfies Palette;
c2.red; // string — validated ✅
c2.missing; // ❌ TypeScript knows "missing" isn't a key — caught!
```

---

## Common Mistake

Using `as` to silence a TypeScript error instead of fixing the root cause:

```ts
// ❌ Using as to hide the problem
function getUser(id: number) {
  return fetch(`/api/users/${id}`).then((r) => r.json() as User);
  // r.json() returns any — "as User" just lies to TypeScript
}

// ✅ Validate at runtime with a type guard
async function getUser(id: number): Promise<User> {
  const data = await fetch(`/api/users/${id}`).then((r) => r.json());
  if (!isUser(data)) throw new Error("Invalid user response");
  return data; // TypeScript knows it's User because of the type guard
}
```

---

## When to Reach For Each

| Tool        | Use when                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| `never`     | Exhaustive switch/if checks; functions that always throw                 |
| `as`        | You genuinely know more than TypeScript (DOM, JSON parsing); last resort |
| `satisfies` | Config objects where you want validation AND literal type preservation   |

---

## Key Takeaways

| Concept                   | Example                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `never` type              | Return type of a function that always throws                  |
| Exhaustive check          | `const _: never = x` in default branch                        |
| `as` assertion            | `x as HTMLCanvasElement` — compile-time only                  |
| `satisfies`               | `config satisfies Config` — validates without widening        |
| `as` danger               | Can lie to TypeScript — use as last resort                    |
| `satisfies` vs annotation | annotation widens; satisfies validates and keeps literal type |
