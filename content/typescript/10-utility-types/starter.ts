// Exercise: Replace each `unknown` with the correct utility type.

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
};

// 1. A type for updating a user — all fields optional (PATCH endpoint)
type UserUpdate = unknown;

// 2. A type with only name and email — used for contact forms
type UserContact = unknown;

// 3. A type without the id field — used when creating a new user
type NewUser = unknown;

// 4. A type mapping each role to an array of users
type UsersByRole = unknown;

// 5. Extract the return type of this function without manually writing it out
function fetchUser() {
  return { id: 1, name: "Prashant", email: "p@g.com", role: "admin" as const };
}
type FetchedUser = unknown;

// Test: log an example of each shape
const update: UserUpdate = { name: "New Name" };
const contact: UserContact = { name: "Prashant", email: "p@g.com" };
const newUser: NewUser = { name: "Prashant", email: "p@g.com", role: "viewer" };
const roster: UsersByRole = { admin: [], viewer: [] };

console.log(update, contact, newUser, roster);
