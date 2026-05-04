type VehicleData = {
  make: string;
  model: string;
  year: number;
  mileage: number;
};

const car: VehicleData = {
  make: "Toyota",
  model: "Camry",
  year: 2020,
  mileage: 45000,
};
console.log(car);

interface Vehicle {
  make: string;
  model: string;
  year: number;
  describe(): string;
  isVintage(): boolean;
}

class Car implements Vehicle {
  constructor(
    public make: string,
    public model: string,
    public year: number,
  ) {}

  describe(): string {
    return `${this.year} ${this.make} ${this.model}`;
  }

  isVintage(): boolean {
    return this.year < 1980;
  }
}

class Motorcycle implements Vehicle {
  constructor(
    public make: string,
    public model: string,
    public year: number,
  ) {}

  describe(): string {
    return `${this.year} ${this.make} ${this.model}`;
  }

  isVintage(): boolean {
    return this.year < 1980;
  }
}

const myCar = new Car("Toyota", "Camry", 2020);
const myBike = new Motorcycle("Harley-Davidson", "Sportster", 1975);

console.log(myCar.describe()); // "2020 Toyota Camry"
console.log(myBike.describe()); // "1975 Harley-Davidson Sportster"
console.log(myBike.isVintage()); // true
console.log(myCar.isVintage()); // false

// A: VehicleData is just a data shape — no behavior. type is fine for that.
//    (Could also be interface, but it won't be extended or implemented)

// A: Car implements Vehicle — Vehicle is an interface (contract), not a base class.
//    extends is for class inheritance; implements is for interface contracts.

// A: If Vehicle were a class, Car couldn't also extend another class (JS single inheritance).
//    Making it an interface keeps it open — Car could extend BaseVehicle AND implement Vehicle.
