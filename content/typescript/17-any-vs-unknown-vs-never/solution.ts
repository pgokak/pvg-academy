function parseJSON(raw: string): unknown {
  return JSON.parse(raw);
}

const result = parseJSON('{"name":"Prashant","age":32}');
// result.name would be a TypeScript error — you must narrow first
if (typeof result === "object" && result !== null && "name" in result) {
  console.log((result as { name: string }).name); // "Prashant"
}

function panic(message: string): never {
  throw new Error(message);
}

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
      const _: never = method;
      return _;
  }
}

console.log(handleMethod("GET")); // "fetching"
console.log(handleMethod("DELETE")); // "deleting"

function safeDivide(a: number, b: number): number | string {
  try {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  } catch (e) {
    if (e instanceof Error) return e.message;
    return String(e);
  }
}

console.log(safeDivide(10, 2)); // 5
console.log(safeDivide(10, 0)); // "Division by zero"
