// Angular Testing — Starter Exercise
// This file is written as a spec-style TypeScript file.
// In a real Angular project these would live in *.spec.ts files
// and run with Jasmine + Karma or Jest.
//
// Commented Angular testing imports:
// import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { By } from '@angular/platform-browser';
// import { of } from 'rxjs';

// ─────────────────────────────────────────────
// The classes we're testing (simplified, no Angular DI)
// ─────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
}

// Simulated UserService (in a real app, this uses HttpClient)
class UserService {
  private users: User[] = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
  ];

  getUser(id: number): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    return user
      ? Promise.resolve(user)
      : Promise.reject(new Error(`User ${id} not found`));
  }

  getUsers(): Promise<User[]> {
    return Promise.resolve([...this.users]);
  }
}

// Simplified UserCardComponent (no template — pure logic)
class UserCardComponent {
  user: User | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  // In a real component this would be injected:
  // private userService = inject(UserService);
  private userService: UserService;

  // @Output() userSelected = new EventEmitter<User>();

  constructor(service?: UserService) {
    this.userService = service ?? new UserService();
  }

  async loadUser(id: number): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      this.user = await this.userService.getUser(id);
    } catch (err) {
      this.errorMessage = (err as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  selectUser(): User | null {
    // In a real component: this.userSelected.emit(this.user!);
    return this.user;
  }
}

// ─────────────────────────────────────────────
// TEST SUITE (spec-style)
// ─────────────────────────────────────────────

// Simple test runner (no Angular testing module needed for plain TS)
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

async function runTest(
  name: string,
  fn: () => Promise<void> | void,
): Promise<TestResult> {
  try {
    await fn();
    return { name, passed: true };
  } catch (err) {
    return { name, passed: false, error: (err as Error).message };
  }
}

function expect<T>(actual: T) {
  return {
    toBe: (expected: T) => {
      if (actual !== expected)
        throw new Error(
          `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`,
        );
    },
    toEqual: (expected: T) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
        );
      }
    },
    toContain: (expected: string) => {
      if (typeof actual !== "string" || !actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
    toBeTruthy: () => {
      if (!actual)
        throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
    },
    toBeNull: () => {
      if (actual !== null)
        throw new Error(`Expected ${JSON.stringify(actual)} to be null`);
    },
    not: {
      toBeNull: () => {
        if (actual === null) throw new Error(`Expected value not to be null`);
      },
    },
  };
}

// ─────────────────────────────────────────────
// TODO 1: Write a test that renders UserCardComponent with a user @Input
//         and verifies the user was set correctly.
// ─────────────────────────────────────────────

async function test_rendersUserFromInput(): Promise<void> {
  // TODO: create a UserCardComponent, set component.user to a mock user,
  // then assert component.user.name equals the expected value.
  // In a real Angular test you'd also call fixture.detectChanges() and
  // query the DOM. Here, just test the component class logic.

  const component = new UserCardComponent();

  // TODO: set component.user and assert it was set
  // component.user = ???;
  // expect(component.user?.name).toBe(???);

  throw new Error("TODO: implement this test");
}

// ─────────────────────────────────────────────
// TODO 2: Write a test that mocks UserService and verifies
//         loadUser() sets component.user correctly.
// ─────────────────────────────────────────────

async function test_loadsUserFromService(): Promise<void> {
  const mockUser: User = {
    id: 99,
    name: "Test User",
    email: "test@example.com",
  };

  // TODO: create a mock UserService that returns mockUser when getUser(99) is called.
  // Then create a UserCardComponent with the mock service.
  // Call component.loadUser(99) and assert component.user equals mockUser.

  // Hint: class MockUserService { getUser(id: number) { return Promise.resolve(mockUser); } }
  throw new Error("TODO: implement this test");
}

// ─────────────────────────────────────────────
// TODO 3: Write a test that clicks a button (calls selectUser())
//         and checks it returns the current user (simulating @Output).
// ─────────────────────────────────────────────

async function test_selectUserReturnsCurrentUser(): Promise<void> {
  const mockUser: User = { id: 1, name: "Alice", email: "alice@example.com" };

  // TODO: set component.user to mockUser, call component.selectUser(),
  // and assert the return value equals mockUser.
  throw new Error("TODO: implement this test");
}

// ─────────────────────────────────────────────
// Test runner
// ─────────────────────────────────────────────

async function runAllTests(): Promise<void> {
  const tests = [
    runTest("renders user from @Input", test_rendersUserFromInput),
    runTest("loads user from mocked service", test_loadsUserFromService),
    runTest(
      "selectUser() returns current user",
      test_selectUserReturnsCurrentUser,
    ),
  ];

  const results = await Promise.all(tests);
  results.forEach((r) => {
    console.log(
      `${r.passed ? "PASS" : "FAIL"} — ${r.name}${r.error ? ": " + r.error : ""}`,
    );
  });
}

runAllTests();

export { UserCardComponent, UserService };
export type { User };
