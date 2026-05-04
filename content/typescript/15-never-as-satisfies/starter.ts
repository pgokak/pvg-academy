// Exercise: Use never, as, and satisfies correctly in each scenario.

// --- PART 1: never for exhaustive checks ---

type Shape = "circle" | "rectangle" | "triangle";

// Add a never check to the default branch so TypeScript errors
// if you ever add a new shape and forget to handle it here
function describeShape(shape: Shape): string {
  switch (shape) {
    case "circle":
      return "A round shape";
    case "rectangle":
      return "A 4-sided shape";
    case "triangle":
      return "A 3-sided shape";
    default:
      // Add: const _: never = shape; return _;
      throw new Error("Unknown shape");
  }
}

console.log(describeShape("circle")); // "A round shape"
console.log(describeShape("triangle")); // "A 3-sided shape"

// --- PART 2: as for DOM access ---

// The return type of getElementById is HTMLElement | null
// Use `as` to tell TypeScript it's definitely an HTMLInputElement
// (Imagine this runs in a browser with <input id="username" type="text">)
function getInputValue(): string {
  const input = document.getElementById("username");
  // Fix: cast input to HTMLInputElement using `as`
  return input.value; // ❌ currently errors — HTMLElement | null has no .value
}

// --- PART 3: satisfies for config objects ---

type AppConfig = {
  port: number | string;
  host: string;
  debug: boolean;
};

// Use `satisfies` instead of a type annotation so TypeScript:
// 1. Validates the object matches AppConfig
// 2. Keeps port as number (not number | string) for autocomplete
const config = {
  port: 3000,
  host: "localhost",
  debug: false,
};
// Hint: add `satisfies AppConfig` after the closing brace

// This should work after applying satisfies (port is a number):
console.log(config.port.toFixed(0)); // "3000"
