interface Account {
  owner: string;
  deposit(amount: number): void;
  withdraw(amount: number): boolean;
  getBalance(): number;
}

class BankAccount implements Account {
  private balance: number;

  constructor(
    public readonly owner: string,
    initialBalance: number,
  ) {
    this.balance = initialBalance;
  }

  deposit(amount: number): void {
    this.balance += amount;
  }

  withdraw(amount: number): boolean {
    if (amount > this.balance) return false;
    this.balance -= amount;
    return true;
  }

  getBalance(): number {
    return this.balance;
  }

  static empty(owner: string): BankAccount {
    return new BankAccount(owner, 0);
  }
}

const acc = new BankAccount("Prashant", 1000);
console.log(acc.owner); // "Prashant"
console.log(acc.getBalance()); // 1000
acc.deposit(500);
console.log(acc.getBalance()); // 1500
console.log(acc.withdraw(200)); // true
console.log(acc.getBalance()); // 1300
console.log(acc.withdraw(2000)); // false
console.log(acc.getBalance()); // 1300

const empty = BankAccount.empty("Alice");
console.log(empty.getBalance()); // 0
