// Exercise: Implement the Vehicle concept three different ways.
// Each way teaches you when that tool is the right choice.

// --- PART 1: As a type ---
// Just the data shape — no behavior, no instances
// Use when: describing data that flows through the system
type VehicleData = unknown; // { make: string; model: string; year: number; mileage: number }

const car: VehicleData = {
  make: "Toyota",
  model: "Camry",
  year: 2020,
  mileage: 45000,
};
console.log(car);

// --- PART 2: As an interface ---
// A contract — defines what a Vehicle must be able to do
// Use when: multiple classes will implement the same behavior
interface Vehicle {
  // Add: make, model, year as properties
  // Add: describe(): string  — returns a description of the vehicle
  // Add: isVintage(): boolean — returns true if year < 1980
}

// Implement the interface with a Car class
class Car implements Vehicle {
  // your code here
}

// Implement the same interface with a Motorcycle class
class Motorcycle implements Vehicle {
  // your code here
}

const myCar = new Car("Toyota", "Camry", 2020);
const myBike = new Motorcycle("Harley-Davidson", "Sportster", 1975);

console.log(myCar.describe()); // "2020 Toyota Camry"
console.log(myBike.describe()); // "1975 Harley-Davidson Sportster"
console.log(myBike.isVintage()); // true (1975 < 1980)
console.log(myCar.isVintage()); // false (2020 >= 1980)

// --- PART 3: Reflection ---
// Answer in comments:

// Q: Why is VehicleData a type and not an interface?
// A: ???

// Q: Why does Car use `implements Vehicle` instead of `extends Vehicle`?
// A: ???

// Q: What would break if you made Vehicle a class that Car extends?
// A: ???
