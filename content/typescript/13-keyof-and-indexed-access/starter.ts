// Exercise: Use keyof and indexed access to make these functions type-safe.

type User = {
  name: string;
  age: number;
  email: string;
  active: boolean;
};

// 1. Make this function type-safe using keyof and T[K]
// Goal: get(user, "name") should return string
//       get(user, "age") should return number
//       get(user, "naem") should be a TypeScript error
function get(obj: any, key: string): any {
  return obj[key];
}

const user: User = {
  name: "Prashant",
  age: 32,
  email: "p@g.com",
  active: true,
};
console.log(get(user, "name")); // "Prashant" — should be typed as string
console.log(get(user, "age")); // 32 — should be typed as number

// 2. Make this function type-safe — it picks multiple keys from an object
// pluck(user, ["name", "email"]) should return { name: string; email: string }
// Hint: K extends keyof T, and return type is Pick<T, K>
function pluck(obj: any, keys: string[]): any {
  const result: any = {};
  keys.forEach((k) => (result[k] = obj[k]));
  return result;
}

const contact = pluck(user, ["name", "email"]);
console.log(contact); // { name: "Prashant", email: "p@g.com" }

// 3. Use typeof and keyof to get the keys of this config object
// without manually writing a type
const config = { host: "localhost", port: 3000, debug: false };

// Write the type for config's keys using typeof + keyof (no manual typing)
type ConfigKey = unknown; // replace with the correct expression

// Test: these should all be valid ConfigKey values
const k1: ConfigKey = "host";
const k2: ConfigKey = "port";
const k3: ConfigKey = "debug";
