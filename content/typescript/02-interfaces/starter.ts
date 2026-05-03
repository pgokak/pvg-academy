// Exercise: Define interfaces and use them to type the objects below.

// 1. Define an interface called Product with:
//    - id: number
//    - name: string
//    - price: number
//    - inStock: boolean

// Write your interface here:

// 2. Create a variable 'laptop' of type Product
const laptop = {
  id: 1,
  name: "ThinkPad X1",
  price: 120000,
  inStock: true,
};

// 3. Define an interface called Address with:
//    - street: string
//    - city: string
//    - pincode: string
//    - landmark: optional string

// Write your interface here:

// 4. Create a variable 'office' of type Address (no landmark needed)
const office = {
  street: "MG Road",
  city: "Bengaluru",
  pincode: "560001",
};

// 5. Write a function printProduct that takes a Product and logs:
//    "ThinkPad X1 — ₹120000 (in stock)"  or  "ThinkPad X1 — ₹120000 (out of stock)"
function printProduct(product) {
  const status = product.inStock ? "in stock" : "out of stock";
  console.log(`${product.name} — ₹${product.price} (${status})`);
}

printProduct(laptop);
