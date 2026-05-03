// 1. Typed name prop inline
function Greeting({ name }: { name: string }): string {
  return `Hello, ${name}!`;
}

// 2. Interface + typed component
interface UserCardProps {
  username: string;
  email: string;
  role: "admin" | "member" | "guest";
  avatarUrl?: string;
}

function UserCard({ username, email, role, avatarUrl }: UserCardProps): string {
  const avatar = avatarUrl ?? "default.png";
  return `${username} (${role}) — ${email} — ${avatar}`;
}

// 3. children typed as string (simplified — real React uses React.ReactNode)
function Panel({
  title,
  children,
}: {
  title: string;
  children: string;
}): string {
  return `[${title}]: ${children}`;
}

console.log(Greeting({ name: "Prashant" }));
console.log(
  UserCard({ username: "pgokak", email: "p@example.com", role: "admin" }),
);
console.log(Panel({ title: "Info", children: "Some content here" }));
