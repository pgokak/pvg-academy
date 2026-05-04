type Shape = "circle" | "rectangle" | "triangle";

function describeShape(shape: Shape): string {
  switch (shape) {
    case "circle":
      return "A round shape";
    case "rectangle":
      return "A 4-sided shape";
    case "triangle":
      return "A 3-sided shape";
    default:
      const _: never = shape;
      return _;
  }
}

console.log(describeShape("circle")); // "A round shape"
console.log(describeShape("triangle")); // "A 3-sided shape"

// Part 2: as for DOM — in browser environment
// const input = document.getElementById("username") as HTMLInputElement;
// console.log(input.value);

// Part 3: satisfies
type AppConfig = {
  port: number | string;
  host: string;
  debug: boolean;
};

const config = {
  port: 3000,
  host: "localhost",
  debug: false,
} satisfies AppConfig;

// port is number (not number | string) — satisfies keeps the literal
console.log(config.port.toFixed(0)); // "3000"
console.log(config.host, config.debug);
