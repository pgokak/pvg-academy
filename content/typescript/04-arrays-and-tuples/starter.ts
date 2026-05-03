// Exercise: Add type annotations to all arrays and tuples below.

// 1. Annotate this array of strings
const cities = ["Mumbai", "Delhi", "Bengaluru", "Chennai"];

// 2. Annotate this array of numbers
const temperatures = [28.5, 31.2, 26.8, 30.0];

// 3. Define an interface Employee and annotate the array
const employees = [
  { id: 1, name: "Prashant", department: "Engineering" },
  { id: 2, name: "Anjali", department: "Design" },
  { id: 3, name: "Rahul", department: "Product" },
];

// 4. Annotate this tuple — it stores [productName, price]
const featured = ["Wireless Headphones", 2999];

// 5. Fix this function — it should return a tuple [min, max]
function getRange(numbers) {
  return [Math.min(...numbers), Math.max(...numbers)];
}

// Test your work
console.log(cities[0]);
console.log(temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length);
console.log(employees.map((e) => e.name));
console.log(featured[0], "costs ₹" + featured[1]);
const [min, max] = getRange([5, 1, 8, 3, 9, 2]);
console.log("Min:", min, "Max:", max);
