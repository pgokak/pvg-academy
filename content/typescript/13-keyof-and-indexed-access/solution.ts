type User = {
  name: string;
  age: number;
  email: string;
  active: boolean;
};

function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = {
  name: "Prashant",
  age: 32,
  email: "p@g.com",
  active: true,
};
console.log(get(user, "name")); // "Prashant" — typed as string
console.log(get(user, "age")); // 32 — typed as number

function pluck<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((k) => (result[k] = obj[k]));
  return result;
}

const contact = pluck(user, ["name", "email"]);
console.log(contact); // { name: "Prashant", email: "p@g.com" }

const config = { host: "localhost", port: 3000, debug: false };

type ConfigKey = keyof typeof config; // "host" | "port" | "debug"

const k1: ConfigKey = "host";
const k2: ConfigKey = "port";
const k3: ConfigKey = "debug";

console.log(k1, k2, k3);
