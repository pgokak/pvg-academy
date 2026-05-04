// Exercise: Implement the same concept using both enum and union literals.
// Then answer the questions in the comments to understand the tradeoffs.

// --- PART 1: Implement as an enum ---

// Create a string enum called Direction with: Up="UP", Down="DOWN", Left="LEFT", Right="RIGHT"
enum Direction {
  // your code here
}

// Create a string enum called HttpStatus with: Ok="200", NotFound="404", ServerError="500"
enum HttpStatus {
  // your code here
}

// --- PART 2: Implement the same thing as union literals ---

// Create a type alias Direction for the same four directions
type DirectionLiteral = unknown; // replace with "UP" | "DOWN" | ...

// Create a type alias for the same HTTP statuses
type HttpStatusLiteral = unknown; // replace with "200" | "404" | "500"

// --- PART 3: Use both and compare ---

function moveEnum(dir: Direction): string {
  return `Moving ${dir}`;
}

function moveLiteral(dir: DirectionLiteral): string {
  return `Moving ${dir}`;
}

// These use enum — must reference the enum name
console.log(moveEnum(Direction.Up)); // "Moving UP"

// These use union — can pass the string directly
console.log(moveLiteral("UP")); // "Moving UP"

// --- PART 4: Which would you use for each scenario? ---
// Write your answer as a comment

// A) Status values stored in a database and returned from an API
// Answer: ???

// B) A set of log levels (Debug, Info, Warn, Error) used only internally in your app
// Answer: ???

// C) HTTP methods used in a REST client library others will import
// Answer: ???
