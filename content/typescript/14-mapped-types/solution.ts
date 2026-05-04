type User = { name: string; age: number; email: string };

type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type MyRecord<K extends string, V> = {
  [Key in K]: V;
};

type PartialUser = MyPartial<User>;
type FrozenUser = MyReadonly<User>;
type NullableUser = Nullable<User>;
type RoleMap = MyRecord<"admin" | "viewer", string[]>;

const update: PartialUser = { name: "Prashant" };
const frozen: FrozenUser = { name: "Prashant", age: 32, email: "p@g.com" };
const roles: RoleMap = { admin: ["alice"], viewer: ["bob"] };

console.log(update, frozen, roles);
