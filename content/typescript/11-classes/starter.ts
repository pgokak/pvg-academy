// Exercise: Build out the classes below following the instructions in each comment.

// 1. Implement this interface with a BankAccount class
interface Account {
  owner: string;
  deposit(amount: number): void;
  withdraw(amount: number): boolean; // returns false if insufficient funds
  getBalance(): number;
}

// Requirements:
// - owner should be public and readonly
// - balance should be private (starts at initialBalance from constructor)
// - Use constructor shorthand for owner (public readonly owner: string)
// - withdraw returns false if amount > balance, otherwise deducts and returns true
class BankAccount implements Account {
  // your code here
}

const acc = new BankAccount("Prashant", 1000);
console.log(acc.owner); // "Prashant"
console.log(acc.getBalance()); // 1000
acc.deposit(500);
console.log(acc.getBalance()); // 1500
console.log(acc.withdraw(200)); // true
console.log(acc.getBalance()); // 1300
console.log(acc.withdraw(2000)); // false — insufficient funds
console.log(acc.getBalance()); // 1300 — unchanged

// 2. Add a static factory method to create a zero-balance account
// BankAccount.empty("Prashant") should return new BankAccount("Prashant", 0)
const empty = BankAccount.empty("Alice");
console.log(empty.getBalance()); // 0
