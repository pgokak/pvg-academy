// Exercise: Fix the component definitions below by adding proper TypeScript types.
// Note: In a real .tsx file these would return JSX. Here we simulate with strings.

// 1. Add a type annotation for the 'name' prop
function Greeting({ name }) {
  return `Hello, ${name}!`;
}

// 2. Define a UserCardProps interface with:
//    - username: string
//    - email: string
//    - role: "admin" | "member" | "guest"   (literal union!)
//    - avatarUrl: optional string
// Then type the component's props with it.
function UserCard({ username, email, role, avatarUrl }) {
  const avatar = avatarUrl ?? "default.png";
  return `${username} (${role}) — ${email} — ${avatar}`;
}

// 3. Add the correct type for 'children' in this wrapper component
function Panel({ title, children }) {
  return `[${title}]: ${children}`;
}

// Test your work
console.log(Greeting({ name: "Prashant" }));
console.log(
  UserCard({ username: "pgokak", email: "p@example.com", role: "admin" }),
);
console.log(Panel({ title: "Info", children: "Some content here" }));
