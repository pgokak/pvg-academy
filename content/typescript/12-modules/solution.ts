// 1. Named import from "./math":
// import { add, PI } from "./math";

// 2. Default import from "./math":
// import subtract from "./math";

// 3. Type-only import from "./types":
// import type { Point } from "./types";

// 5. `import type` imports only the type — TypeScript erases it entirely at
// compile time. It has no runtime footprint and cannot be used as a value.

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

type Point = { x: number; y: number };

const circleArea = multiply(PI, multiply(5, 5));
const sum = add(10, 20);
const diff = subtract(100, 37);
const p: Point = { x: 3, y: 4 };

console.log("Circle area:", circleArea.toFixed(2)); // 78.54
console.log("Sum:", sum); // 30
console.log("Difference:", diff); // 63
console.log("Point:", p); // { x: 3, y: 4 }
