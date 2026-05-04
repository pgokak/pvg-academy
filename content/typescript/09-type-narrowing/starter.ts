// Exercise: Add type guards to make each function type-safe.

// 1. Narrow using typeof
// Return the value doubled: numbers multiply by 2, strings repeat twice
function doubleIt(value: string | number): string | number {
  // Add a typeof check here
  return value;
}

console.log(doubleIt(5)); // 10
console.log(doubleIt("hi")); // "hihi"

// 2. Narrow using a discriminated union
// Each shape has a `kind` field — use it to compute the right area
type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };
type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  // Use switch on shape.kind
  return 0;
}

console.log(area({ kind: "circle", radius: 5 })); // ~78.54
console.log(area({ kind: "rectangle", width: 4, height: 6 })); // 24

// 3. Narrow using `in` operator
type Cat = { meow(): string };
type Dog = { bark(): string };

function makeSound(animal: Cat | Dog): string {
  // Check for "meow" in animal to narrow the type
  return "";
}

console.log(makeSound({ meow: () => "meow!" })); // "meow!"
console.log(makeSound({ bark: () => "woof!" })); // "woof!"
