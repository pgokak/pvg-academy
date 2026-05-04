// Exercise: Replace each `unknown` with the correct type alias definition.

// 1. A type alias for a user's ID (just a number)
type UserId = unknown;

// 2. A type alias that can be a string OR null
type MaybeString = unknown;

// 3. A type alias for a 2D point with x and y coordinates
type Point = unknown;

// 4. A type alias combining an ID and a name into one object
// Hint: use intersection &
type HasId = { id: number };
type HasName = { name: string };
type Named = unknown;

// 5. Use your Point type to annotate this function's parameters and return type
function midpoint(a: unknown, b: unknown): unknown {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

console.log(midpoint({ x: 0, y: 0 }, { x: 4, y: 6 })); // { x: 2, y: 3 }
