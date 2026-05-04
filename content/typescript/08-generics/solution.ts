function first<T>(arr: T[]): T {
  return arr[0];
}

function wrap<T>(value: T): { value: T } {
  return { value };
}

function getKeys<T extends object>(obj: T): string[] {
  return Object.keys(obj);
}

function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const name = first(["Alice", "Bob"]);
console.log(name.toUpperCase()); // Alice

const wrapped = wrap(42);
console.log(wrapped.value + 1); // 43

const keys = getKeys({ a: 1, b: 2 });
console.log(keys); // ["a", "b"]

const entry = pair("score", 100);
console.log(entry); // ["score", 100]
