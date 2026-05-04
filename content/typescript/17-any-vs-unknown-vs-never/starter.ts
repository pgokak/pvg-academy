// Exercise: Replace `any` with the correct type: unknown, never, or a specific type.

// 1. parseJSON receives data from an external source — could be anything.
// Use `unknown` instead of `any` so callers are forced to narrow before using it.
function parseJSON(raw: string): any {
  return JSON.parse(raw);
}

// Usage: after fixing to unknown, this should require narrowing
const result = parseJSON('{"name":"Prashant","age":32}');
// console.log(result.name); // This should be an error with unknown

// 2. This function always throws — it should never return a value.
// Give it the correct return type.
function panic(message: string): any {
  throw new Error(message);
}

// 3. Add an exhaustive never check to this switch.
// If you add "PATCH" to HttpMethod later without updating the switch,
// TypeScript should give you a compile error.
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function handleMethod(method: HttpMethod): string {
  switch (method) {
    case "GET":
      return "fetching";
    case "POST":
      return "creating";
    case "PUT":
      return "updating";
    case "DELETE":
      return "deleting";
    default:
      // Add a never check here
      throw new Error("Unhandled method");
  }
}

console.log(handleMethod("GET")); // "fetching"
console.log(handleMethod("DELETE")); // "deleting"

// 4. Fix the catch block — `e` should be unknown, then narrow before accessing .message
function safeDivide(a: number, b: number): number | string {
  try {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  } catch (e: any) {
    return e.message; // ❌ dangerous — e.message assumes e is an Error
  }
}

console.log(safeDivide(10, 2)); // 5
console.log(safeDivide(10, 0)); // "Division by zero"
