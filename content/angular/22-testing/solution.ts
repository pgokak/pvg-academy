// Angular Testing — Solution
// Commented Angular testing imports:
// import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { By } from '@angular/platform-browser';
// import { of } from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
}

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

class UserCardComponent {
  user: User | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  private userService: UserService;

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
    return this.user;
  }
}

// ─────────────────────────────────────────────
// Test runner helpers
// ─────────────────────────────────────────────

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
// Solution 1: Test @Input rendering
// ─────────────────────────────────────────────

async function test_rendersUserFromInput(): Promise<void> {
  const component = new UserCardComponent();
  const mockUser: User = { id: 1, name: "Alice", email: "alice@example.com" };

  // Simulate setting @Input
  component.user = mockUser;

  // Assert component state (in a real test, also check the DOM with fixture.detectChanges())
  expect(component.user).not.toBeNull();
  expect(component.user?.name).toBe("Alice");
  expect(component.user?.email).toBe("alice@example.com");

  // Real Angular test equivalent:
  // component.user = mockUser;
  // fixture.detectChanges();                                   // <-- DON'T FORGET THIS
  // const nameEl = fixture.nativeElement.querySelector('h2');
  // expect(nameEl.textContent).toContain('Alice');
}

// ─────────────────────────────────────────────
// Solution 2: Test with mocked UserService
// ─────────────────────────────────────────────

async function test_loadsUserFromService(): Promise<void> {
  const mockUser: User = {
    id: 99,
    name: "Test User",
    email: "test@example.com",
  };

  // Create a mock service that returns our controlled data
  class MockUserService {
    getUser(_id: number): Promise<User> {
      return Promise.resolve(mockUser);
    }
    getUsers(): Promise<User[]> {
      return Promise.resolve([mockUser]);
    }
  }

  const component = new UserCardComponent(new MockUserService() as UserService);

  // Call the method that uses the service
  await component.loadUser(99);

  // Assert the component's state was updated with the mocked data
  expect(component.user).toEqual(mockUser);
  expect(component.isLoading).toBe(false);
  expect(component.errorMessage).toBeNull();

  // Real Angular test equivalent:
  // const mockSvc = { getUser: jasmine.createSpy().and.returnValue(of(mockUser)) };
  // TestBed.configureTestingModule({
  //   imports: [UserCardComponent],
  //   providers: [{ provide: UserService, useValue: mockSvc }]
  // });
  // fixture = TestBed.createComponent(UserCardComponent);
  // component = fixture.componentInstance;
  // fixture.detectChanges();  // triggers ngOnInit
  // await fixture.whenStable();
  // expect(component.user).toEqual(mockUser);
}

// ─────────────────────────────────────────────
// Solution 3: Test @Output / event emission
// ─────────────────────────────────────────────

async function test_selectUserReturnsCurrentUser(): Promise<void> {
  const mockUser: User = { id: 1, name: "Alice", email: "alice@example.com" };
  const component = new UserCardComponent();
  component.user = mockUser;

  // Simulate clicking the "select" button — calls selectUser()
  const selected = component.selectUser();

  expect(selected).toEqual(mockUser);

  // Real Angular test with @Output:
  // const spy = spyOn(component.userSelected, 'emit');
  // fixture.nativeElement.querySelector('.select-btn').click();
  // fixture.detectChanges();
  // expect(spy).toHaveBeenCalledWith(mockUser);
}

// ─────────────────────────────────────────────
// Bonus: Test error handling path
// ─────────────────────────────────────────────

async function test_setsErrorMessageOnFailure(): Promise<void> {
  class FailingUserService {
    getUser(_id: number): Promise<User> {
      return Promise.reject(new Error("User not found"));
    }
    getUsers(): Promise<User[]> {
      return Promise.resolve([]);
    }
  }

  const component = new UserCardComponent(
    new FailingUserService() as UserService,
  );
  await component.loadUser(999);

  expect(component.user).toBeNull();
  expect(component.isLoading).toBe(false);
  expect(component.errorMessage).toContain("User not found");
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
    runTest(
      "sets errorMessage when service fails",
      test_setsErrorMessageOnFailure,
    ),
  ];

  const results = await Promise.all(tests);
  results.forEach((r) => {
    console.log(
      `${r.passed ? "PASS" : "FAIL"} — ${r.name}${r.error ? ": " + r.error : ""}`,
    );
  });

  const passed = results.filter((r) => r.passed).length;
  console.log(`\n${passed}/${results.length} tests passed`);
}

runAllTests();

export { UserCardComponent, UserService };
export type { User };
