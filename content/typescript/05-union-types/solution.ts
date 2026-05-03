// 1. Union type annotation
let id: string | number;
id = "user-42";
id = 99;

// 2. Function with union parameter, return type, and type narrowing
function process(value: string | number): string | number {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value * 2;
}

// 3. Literal union type alias
type Direction = "north" | "south" | "east" | "west";

// 4. Function using the Direction type
function move(direction: Direction): void {
  console.log("Moving:", direction);
}

// 5. Discriminated union with kind field
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
    return Math.PI * shape.radius ** 2;
  }
  return shape.width * shape.height;
}

console.log(process("hello"));
console.log(process(5));
move("north");
console.log(area({ kind: "circle", radius: 10 }));
console.log(area({ kind: "rectangle", width: 4, height: 6 }));
