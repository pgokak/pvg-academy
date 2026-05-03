// 1. Array of strings
const cities: string[] = ["Mumbai", "Delhi", "Bengaluru", "Chennai"];

// 2. Array of numbers
const temperatures: number[] = [28.5, 31.2, 26.8, 30.0];

// 3. Array of Employee objects
interface Employee {
  id: number;
  name: string;
  department: string;
}

const employees: Employee[] = [
  { id: 1, name: "Prashant", department: "Engineering" },
  { id: 2, name: "Anjali", department: "Design" },
  { id: 3, name: "Rahul", department: "Product" },
];

// 4. Tuple: [productName, price]
const featured: [string, number] = ["Wireless Headphones", 2999];

// 5. Function returning a [min, max] tuple
function getRange(numbers: number[]): [number, number] {
  return [Math.min(...numbers), Math.max(...numbers)];
}

console.log(cities[0]);
console.log(temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length);
console.log(employees.map((e) => e.name));
console.log(featured[0], "costs ₹" + featured[1]);
const [min, max] = getRange([5, 1, 8, 3, 9, 2]);
console.log("Min:", min, "Max:", max);
