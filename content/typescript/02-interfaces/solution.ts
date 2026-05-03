// 1. Product interface
interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

// 2. laptop typed as Product
const laptop: Product = {
  id: 1,
  name: "ThinkPad X1",
  price: 120000,
  inStock: true,
};

// 3. Address interface with optional landmark
interface Address {
  street: string;
  city: string;
  pincode: string;
  landmark?: string;
}

// 4. office typed as Address
const office: Address = {
  street: "MG Road",
  city: "Bengaluru",
  pincode: "560001",
};

// 5. printProduct with typed parameter
function printProduct(product: Product): void {
  const status = product.inStock ? "in stock" : "out of stock";
  console.log(`${product.name} — ₹${product.price} (${status})`);
}

printProduct(laptop);
