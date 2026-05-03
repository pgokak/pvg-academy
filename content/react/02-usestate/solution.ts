// 1. Explicit generic — useState<number>(0)
function makeCounter() {
  let count: number = 0;
  const setCount = (n: number) => {
    count = n;
  };
  return { count, setCount };
}

// 2. Nullable user state — useState<User | null>(null)
interface User {
  id: number;
  name: string;
}
// useState<User | null>(null)

// 3. Correct object state update — spread to preserve all fields
function updateName(prev: { name: string; email: string }, newName: string) {
  return { ...prev, name: newName }; // preserves email
}

// 4. Function form of setState
function increment(prev: number): number {
  return prev + 1;
}

const counter = makeCounter();
console.log("Initial count:", counter.count);

const fixed = updateName(
  { name: "Old", email: "test@example.com" },
  "Prashant",
);
console.log("Has email?", "email" in fixed);

console.log("Increment from 5:", increment(5));
