// Exercise: Replace `any` with proper generic type parameters.

// 1. Make this function generic so it returns the same type as the array element
// Currently: first(["a","b"]) returns any — it should return string
function first(arr: any[]): any {
  return arr[0];
}

// 2. Make this function generic so wrap("hello") returns { value: string }
function wrap(value: any): { value: any } {
  return { value };
}

// 3. Make this generic with a constraint: T must be an object
// Object.keys() only works on objects — enforce that with extends
function getKeys(obj: any): string[] {
  return Object.keys(obj);
}

// 4. Make this generic with two type parameters K and V
// pair("age", 32) should return type [string, number]
function pair(key: any, value: any): any[] {
  return [key, value];
}

// Test them — after adding generics these should have correct types:
const name = first(["Alice", "Bob"]);
console.log(name.toUpperCase()); // Alice — should be typed as string

const wrapped = wrap(42);
console.log(wrapped.value + 1); // 43 — should be typed as number

const keys = getKeys({ a: 1, b: 2 });
console.log(keys); // ["a", "b"]

const entry = pair("score", 100);
console.log(entry); // ["score", 100]
