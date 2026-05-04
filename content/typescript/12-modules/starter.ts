// Exercise: Demonstrate your understanding of TypeScript modules.
// This file simulates what module patterns look like in a single runnable context.

// --- Imagine these are in separate files ---

// From "math.ts":
// export const PI = 3.14159;
// export function add(a: number, b: number): number { return a + b; }
// export function multiply(a: number, b: number): number { return a * b; }
// export default function subtract(a: number, b: number): number { return a - b; }

// Simulate those exports here so we can use them below:
const PI = 3.14159;
function add(a: number, b: number): number {
  return a + b;
}
function multiply(a: number, b: number): number {
  return a * b;
}
function subtract(a: number, b: number): number {
  return a - b;
}

// 1. Write what the NAMED import statement would look like to get add and PI from "./math"
// (write as a comment)
// import { ??? } from "./math";

// 2. Write what the DEFAULT import statement would look like for subtract
// (write as a comment)
// import ??? from "./math";

// 3. Type alias for a point (imagine this lives in types.ts)
// Write the import type statement you'd use to bring it in
// (write as a comment)
// import type { ??? } from "./types";
type Point = { x: number; y: number };

// 4. Use the functions from above (they represent your imports)
const circleArea = multiply(PI, multiply(5, 5));
const sum = add(10, 20);
const diff = subtract(100, 37);
const p: Point = { x: 3, y: 4 };

console.log("Circle area:", circleArea.toFixed(2)); // 78.54
console.log("Sum:", sum); // 30
console.log("Difference:", diff); // 63
console.log("Point:", p); // { x: 3, y: 4 }

// 5. What does `import type` do differently from a regular import?
// Write your answer as a comment below:
// Answer: ???
