// Exercise: Add type annotations to all functions below.

// 1. Add parameter and return type annotations
function add(a, b) {
  return a + b;
}

// 2. This function returns nothing — annotate the return type as void
function logMessage(message) {
  console.log(message);
}

// 3. Make 'title' an optional parameter
function greet(name, title) {
  if (title) {
    return `Hello, ${title} ${name}`;
  }
  return `Hello, ${name}`;
}

// 4. Give 'separator' a default value of "-"
function createSlug(text, separator) {
  return text.toLowerCase().split(" ").join(separator);
}

// 5. Type the callback parameter fn as a function that takes a number and returns a number
function applyToAll(numbers, fn) {
  return numbers.map(fn);
}

// Test your work
console.log(add(10, 5));
logMessage("TypeScript functions!");
console.log(greet("Prashant"));
console.log(greet("Prashant", "Dr."));
console.log(createSlug("Hello World"));
console.log(applyToAll([1, 2, 3], (n) => n * 2));
