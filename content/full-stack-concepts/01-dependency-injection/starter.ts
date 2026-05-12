// DEPENDENCY INJECTION — Starter Exercise
//
// PROBLEM: UserService creates its own dependencies.
// This makes it impossible to test without a real email server.
//
// YOUR TASKS:
// 1. Define an EmailService interface (not a class) so we can mock it
// 2. Implement a RealEmailService that satisfies the interface
// 3. Refactor UserService to receive EmailService via constructor (Angular-style)
// 4. Implement a MockEmailService for testing
// 5. Write a simple test at the bottom showing UserService works with the mock

// ─── STEP 1: Define the interface ────────────────────────────────────────────
// TODO: Create an `EmailService` interface with a `send(to: string, subject: string): void` method

// ─── STEP 2: Real implementation ─────────────────────────────────────────────
// TODO: Create `RealEmailService` that implements EmailService
// The send() method can just console.log for now

// ─── STEP 3: Refactor UserService ────────────────────────────────────────────
// Replace this broken class with one that accepts EmailService via constructor

class UserService {
  // BAD: creating its own dependency
  private emailService = new RealEmailService(); // This will break — RealEmailService not defined yet

  registerUser(email: string): void {
    this.emailService.send(email, "Welcome to the platform!");
    console.log(`User registered: ${email}`);
  }

  resetPassword(email: string): void {
    this.emailService.send(email, "Password reset link inside");
  }
}

// ─── STEP 4: Mock implementation (for tests) ─────────────────────────────────
// TODO: Create `MockEmailService` that implements EmailService
// It should store sent emails in an array so we can assert on them in tests

// ─── STEP 5: Write a test ────────────────────────────────────────────────────
// TODO: Instantiate UserService with MockEmailService
// Call registerUser() and verify the mock received the correct email + subject
// Hint: no test framework needed — just use console.assert()

function runTests(): void {
  // TODO: write your test here
}

runTests();
