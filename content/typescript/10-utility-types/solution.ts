type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
};

type UserUpdate = Partial<User>;

type UserContact = Pick<User, "name" | "email">;

type NewUser = Omit<User, "id">;

type UsersByRole = Record<"admin" | "viewer", User[]>;

function fetchUser() {
  return { id: 1, name: "Prashant", email: "p@g.com", role: "admin" as const };
}
type FetchedUser = ReturnType<typeof fetchUser>;

const update: UserUpdate = { name: "New Name" };
const contact: UserContact = { name: "Prashant", email: "p@g.com" };
const newUser: NewUser = { name: "Prashant", email: "p@g.com", role: "viewer" };
const roster: UsersByRole = { admin: [], viewer: [] };

console.log(update, contact, newUser, roster);
