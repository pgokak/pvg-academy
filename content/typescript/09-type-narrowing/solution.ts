function doubleIt(value: string | number): string | number {
  if (typeof value === "number") {
    return value * 2;
  }
  return value.repeat(2);
}

console.log(doubleIt(5)); // 10
console.log(doubleIt("hi")); // "hihi"

type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };
type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}

console.log(area({ kind: "circle", radius: 5 })); // ~78.54
console.log(area({ kind: "rectangle", width: 4, height: 6 })); // 24

type Cat = { meow(): string };
type Dog = { bark(): string };

function makeSound(animal: Cat | Dog): string {
  if ("meow" in animal) {
    return animal.meow();
  }
  return animal.bark();
}

console.log(makeSound({ meow: () => "meow!" })); // "meow!"
console.log(makeSound({ bark: () => "woof!" })); // "woof!"
