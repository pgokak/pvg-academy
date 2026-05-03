---
title: "Union Types"
track: "typescript"
version: "TypeScript 5.x"
since: 2012
stable: true
---

## What Is a Union Type?

Sometimes a value can be one of several types. A union type uses `|` to express this:

```ts
let id: string | number;
id = "user-123"; // ✅
id = 456; // ✅
id = true; // ❌ Error: boolean is not string | number
```

Read `string | number` as "either a string or a number".

---

## Why Unions Exist

Real APIs are inconsistent. A product ID might come from a database as a `number` but from a URL parameter as a `string`. Union types let you model that reality honestly instead of pretending everything is always the same type.

---

## Type Narrowing

When you have a union type, TypeScript won't let you use type-specific methods until you narrow it down. This prevents runtime errors:

```ts
function formatId(id: string | number): string {
  // TypeScript won't let you call id.toUpperCase() here — id might be a number
  if (typeof id === "string") {
    return id.toUpperCase(); // ✅ TypeScript knows id is string here
  }
  return id.toString(); // ✅ TypeScript knows id is number here
}
```

The `typeof` check is called a **type guard** — it narrows the union to a specific type inside each branch.

---

## Literal Union Types

Unions aren't just for primitive types. You can union specific string values:

```ts
type Status = "todo" | "in-progress" | "done";

function updateStatus(status: Status): void {
  console.log(`Status updated to: ${status}`);
}

updateStatus("todo"); // ✅
updateStatus("in-progress"); // ✅
updateStatus("archived"); // ❌ Error: not in the union
```

This is far better than using a plain `string` — TypeScript catches invalid values at compile time.

---

## Union with Interfaces

You can union interfaces to model different shapes:

```ts
interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2; // TypeScript knows shape is Circle here
  }
  return shape.width * shape.height; // TypeScript knows shape is Rectangle here
}
```

The `kind` field is a **discriminant** — a literal type that TypeScript uses to narrow the union. This pattern is called a **discriminated union** and is one of the most powerful patterns in TypeScript.

---

## Summary

- `|` creates a union type: `string | number`
- TypeScript prevents using type-specific methods without narrowing
- `typeof` is the most common type guard for primitives
- Literal unions (`"todo" | "in-progress" | "done"`) constrain string values to a known set
- Discriminated unions use a shared `kind` field to narrow interface unions
