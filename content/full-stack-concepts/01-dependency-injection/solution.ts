// DEPENDENCY INJECTION — Solution

// ─── STEP 1: Interface ────────────────────────────────────────────────────────
interface EmailService {
  send(to: string, subject: string): void;
}

// ─── STEP 2: Real implementation ─────────────────────────────────────────────
class RealEmailService implements EmailService {
  send(to: string, subject: string): void {
    console.log(`[SMTP] Sending "${subject}" to ${to}`);
    // In production: connect to SMTP server, send email
  }
}

// ─── STEP 3: Refactored UserService ──────────────────────────────────────────
// Dependencies come IN via constructor — the class doesn't know or care
// whether it receives RealEmailService or MockEmailService
class UserService {
  constructor(private emailService: EmailService) {}

  registerUser(email: string): void {
    this.emailService.send(email, "Welcome to the platform!");
    console.log(`User registered: ${email}`);
  }

  resetPassword(email: string): void {
    this.emailService.send(email, "Password reset link inside");
  }
}

// ─── STEP 4: Mock implementation ─────────────────────────────────────────────
class MockEmailService implements EmailService {
  sentEmails: Array<{ to: string; subject: string }> = [];

  send(to: string, subject: string): void {
    this.sentEmails.push({ to, subject });
    // Does NOT actually send anything — perfect for tests
  }

  getLastEmail(): { to: string; subject: string } | undefined {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  reset(): void {
    this.sentEmails = [];
  }
}

// ─── STEP 5: Tests ───────────────────────────────────────────────────────────
function runTests(): void {
  console.log("Running tests...");

  const mockEmail = new MockEmailService();
  // Inject the mock — UserService has no idea it's not real
  const userService = new UserService(mockEmail);

  // Test 1: registerUser sends a welcome email
  userService.registerUser("alice@example.com");
  console.assert(
    mockEmail.sentEmails.length === 1,
    "FAIL: Should have sent 1 email",
  );
  console.assert(
    mockEmail.getLastEmail()?.to === "alice@example.com",
    "FAIL: Email should go to alice",
  );
  console.assert(
    mockEmail.getLastEmail()?.subject === "Welcome to the platform!",
    "FAIL: Subject should be welcome message",
  );
  console.log("PASS: registerUser sends welcome email");

  // Test 2: resetPassword sends a reset email
  mockEmail.reset();
  userService.resetPassword("bob@example.com");
  console.assert(
    mockEmail.sentEmails.length === 1,
    "FAIL: Should have sent 1 email",
  );
  console.assert(
    mockEmail.getLastEmail()?.subject === "Password reset link inside",
    "FAIL: Subject should be password reset",
  );
  console.log("PASS: resetPassword sends reset email");

  // Production usage — swap in the real service with zero changes to UserService
  const realEmail = new RealEmailService();
  const prodUserService = new UserService(realEmail);
  prodUserService.registerUser("charlie@example.com");

  console.log("\nAll tests passed.");
}

runTests();
