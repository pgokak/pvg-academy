// Exercise: Fix each useState call with the correct types and update patterns.
// (Simulating React state logic with plain TypeScript functions)

// 1. TypeScript can infer this — but write the explicit generic anyway: useState<number>
function makeCounter() {
  let count = 0; // pretend this is useState(0)
  const setCount = (n: number) => {
    count = n;
  };
  return { count, setCount };
}

// 2. This state holds a logged-in user or null.
//    Write the correct generic: useState<??? | null>(null)
interface User {
  id: number;
  name: string;
}
// What generic would you pass to useState for this?
// Write it as a comment: useState<...>(null)

// 3. Fix the object state update — it must not lose the 'email' field
function updateName(prev: { name: string; email: string }, newName: string) {
  // ❌ This loses email — fix it
  return { name: newName };
}

// 4. Use the function form of setState for this counter increment
//    (simulated: the updater receives the previous value)
function increment(prev: number): number {
  // Write this as: (prev) => prev + 1
  return 0; // fix me
}

// Test your work
const counter = makeCounter();
console.log("Initial count:", counter.count);

const fixed = updateName(
  { name: "Old", email: "test@example.com" },
  "Prashant",
);
console.log("Has email?", "email" in fixed);

console.log("Increment from 5:", increment(5));
