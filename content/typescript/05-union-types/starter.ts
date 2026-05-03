// Exercise: Add union types and type narrowing.

// 1. Annotate 'id' so it can be either a string or a number
let id;
id = "user-42";
id = 99;

// 2. Fix this function — add the correct union return type and narrow properly
//    It should return the input uppercased if string, or doubled if number
function process(value) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value * 2;
}

// 3. Create a type alias 'Direction' that only allows "north" | "south" | "east" | "west"
// Write your type alias here:

// 4. Write a function move(direction: Direction) that logs "Moving: <direction>"
function move(direction) {
  console.log("Moving:", direction);
}

// 5. These two interfaces form a discriminated union — add the 'kind' discriminant field
//    Circle should have kind: "circle", Rectangle should have kind: "rectangle"
interface Circle {
  radius: number;
}

interface Rectangle {
  width: number;
  height: number;
}

type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  // Use shape.kind to narrow and calculate correctly
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
  }
  return shape.width * shape.height;
}

// Test your work
console.log(process("hello"));
console.log(process(5));
move("north");
console.log(area({ kind: "circle", radius: 10 }));
console.log(area({ kind: "rectangle", width: 4, height: 6 }));
