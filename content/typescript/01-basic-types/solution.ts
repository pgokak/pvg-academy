// 1. Annotated variables
const username: string = "Prashant";
const score: number = 100;
const isLoggedIn: boolean = true;

// 2. Annotated function
function double(n: number): number {
  return n * 2;
}

// 3. Annotated array
const languages: string[] = ["TypeScript", "JavaScript", "Java"];

// 4. Fixed function — only accepts strings
function greet(name: string): string {
  return "Hello, " + name;
}
