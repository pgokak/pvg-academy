type UserId = number;

type MaybeString = string | null;

type Point = { x: number; y: number };

type HasId = { id: number };
type HasName = { name: string };
type Named = HasId & HasName;

function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

console.log(midpoint({ x: 0, y: 0 }, { x: 4, y: 6 })); // { x: 2, y: 3 }
