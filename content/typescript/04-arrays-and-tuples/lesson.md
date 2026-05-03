---
title: "Arrays and Tuples"
track: "typescript"
version: "TypeScript 5.x"
since: 2012
stable: true
---

## Typing Arrays

There are two equivalent ways to type an array in TypeScript:

```ts
const names: string[] = ["Alice", "Bob", "Charlie"];
const scores: Array<number> = [98, 87, 76];
```

Both mean the same thing. The `string[]` syntax is more common and shorter — use that.

TypeScript enforces the element type throughout:

```ts
names.push("Dave"); // ✅ fine
names.push(42); // ❌ Error: Argument of type 'number' is not assignable to 'string[]'
```

---

## Arrays of Objects

Combine with interfaces you already know:

```ts
interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: "Prashant" },
  { id: 2, name: "Gokak" },
];
```

Now `users.map`, `users.find`, `users.filter` all know the element type — full autocomplete and type safety.

---

## Readonly Arrays

If an array should never be mutated after creation, use `readonly`:

```ts
const STATUSES: readonly string[] = ["todo", "in-progress", "done"];
STATUSES.push("archived"); // ❌ Error: Property 'push' does not exist on type 'readonly string[]'
```

Useful for constants and configuration that must not change.

---

## Tuples

A **tuple** is a fixed-length array where each position has a specific type.

```ts
const point: [number, number] = [10, 20]; // x, y coordinates
const entry: [string, number] = ["score", 100]; // key-value pair
```

Unlike a plain array, TypeScript knows exactly what type is at each index:

```ts
const x = point[0]; // TypeScript knows x is number
const key = entry[0]; // TypeScript knows key is string
```

Accessing an out-of-bounds index is an error:

```ts
point[2]; // ❌ Error: Tuple type '[number, number]' has no element at index '2'
```

---

## When to Use Tuples

Tuples are best when a function needs to return multiple values of different types:

```ts
function getRange(numbers: number[]): [number, number] {
  return [Math.min(...numbers), Math.max(...numbers)];
}

const [min, max] = getRange([5, 1, 8, 3]);
console.log(min, max); // 1 8
```

This is cleaner than returning an object when the values are positional and obvious.

---

## Summary

- `string[]` and `Array<string>` are equivalent — prefer `string[]`
- Array types enforce the element type for all operations
- `readonly string[]` prevents mutation — good for constants
- Tuples are fixed-length arrays with per-position types
- Tuples are useful for returning multiple values from a function
