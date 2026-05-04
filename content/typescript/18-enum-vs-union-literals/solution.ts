enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

enum HttpStatus {
  Ok = "200",
  NotFound = "404",
  ServerError = "500",
}

type DirectionLiteral = "UP" | "DOWN" | "LEFT" | "RIGHT";

type HttpStatusLiteral = "200" | "404" | "500";

function moveEnum(dir: Direction): string {
  return `Moving ${dir}`;
}

function moveLiteral(dir: DirectionLiteral): string {
  return `Moving ${dir}`;
}

console.log(moveEnum(Direction.Up)); // "Moving UP"
console.log(moveLiteral("UP")); // "Moving UP"

// Iterate enum values at runtime — can't do this with union literals
const allDirections = Object.values(Direction);
console.log(allDirections); // ["UP", "DOWN", "LEFT", "RIGHT"]

// A) API/DB status values → union literals — no import needed, strings match JSON directly
// B) Internal log levels → enum — named constants, can iterate for display
// C) HTTP methods in a public library → union literals — callers don't need to import anything
