// Exercise: Write your own versions of built-in utility types using mapped type syntax.
// After this exercise you'll understand exactly how Partial, Readonly, and Record work.

type User = { name: string; age: number; email: string };

// 1. Write MyPartial<T> — makes all properties optional
// Hint: [K in keyof T]?: T[K]
type MyPartial<T> = unknown;

// 2. Write MyReadonly<T> — makes all properties readonly
// Hint: readonly [K in keyof T]: T[K]
type MyReadonly<T> = unknown;

// 3. Write MyRequired<T> — removes optionality from all properties
// Hint: [K in keyof T]-?: T[K]
type MyRequired<T> = unknown;

// 4. Write Nullable<T> — makes every value T[K] | null
type Nullable<T> = unknown;

// 5. Write MyRecord<K, V> — creates an object with keys K and values V
// K must extend string so it can be used as an object key
type MyRecord<K extends string, V> = unknown;

// Test your implementations:
type PartialUser = MyPartial<User>; // { name?: string; age?: number; email?: string }
type FrozenUser = MyReadonly<User>; // { readonly name: string; ... }
type NullableUser = Nullable<User>; // { name: string | null; age: number | null; ... }
type RoleMap = MyRecord<"admin" | "viewer", string[]>; // { admin: string[]; viewer: string[] }

const update: PartialUser = { name: "Prashant" }; // only one field — valid for Partial
const frozen: FrozenUser = { name: "Prashant", age: 32, email: "p@g.com" };
const roles: RoleMap = { admin: ["alice"], viewer: ["bob"] };

console.log(update, frozen, roles);
