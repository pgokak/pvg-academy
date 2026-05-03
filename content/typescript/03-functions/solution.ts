// 1. Typed parameters and return type
function add(a: number, b: number): number {
  return a + b;
}

// 2. void return type
function logMessage(message: string): void {
  console.log(message);
}

// 3. Optional title parameter
function greet(name: string, title?: string): string {
  if (title) {
    return `Hello, ${title} ${name}`;
  }
  return `Hello, ${name}`;
}

// 4. Default separator value
function createSlug(text: string, separator: string = "-"): string {
  return text.toLowerCase().split(" ").join(separator);
}

// 5. Typed callback parameter
function applyToAll(numbers: number[], fn: (n: number) => number): number[] {
  return numbers.map(fn);
}

console.log(add(10, 5));
logMessage("TypeScript functions!");
console.log(greet("Prashant"));
console.log(greet("Prashant", "Dr."));
console.log(createSlug("Hello World"));
console.log(applyToAll([1, 2, 3], (n) => n * 2));
