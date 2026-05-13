// Angular Change Detection — Solution
// Commented imports (would resolve in a real Angular project):
// import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
}

function fetchUsersAsync(callback: (users: User[]) => void): void {
  setTimeout(() => {
    callback([
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
      { id: 3, name: "Carol", email: "carol@example.com" },
    ]);
  }, 500);
}

// Solution 1: OnPush strategy applied via decorator
// @Component({
//   selector: 'app-user-list',
//   changeDetection: ChangeDetectionStrategy.OnPush,  // <-- Added
//   template: `
//     <ul>
//       <li *ngFor="let user of users">{{ user.name }} — {{ user.email }}</li>
//     </ul>
//     <button (click)="addUser()">Add User</button>
//   `
// })
class UserListComponent /* implements OnInit */ {
  users: User[] = [{ id: 1, name: "Alice", email: "alice@example.com" }];

  // Solution 2: ChangeDetectorRef injected
  // private cdr = inject(ChangeDetectorRef);

  // ngOnInit(): void {
  //   this.loadUsersAsync();
  // }

  loadUsersAsync(): void {
    fetchUsersAsync((loadedUsers: User[]) => {
      this.users = loadedUsers;
      // Solution 2 (continued): markForCheck() tells Angular to check
      // this component on the next change detection cycle.
      // Required because the callback runs outside Angular's zone
      // and OnPush won't detect the assignment automatically.
      // this.cdr.markForCheck();
    });
  }

  addUser(): void {
    const newUser: User = {
      id: this.users.length + 1,
      name: `User ${this.users.length + 1}`,
      email: `user${this.users.length + 1}@example.com`,
    };

    // Solution 3: Immutable update — creates a NEW array reference.
    // OnPush compares references with ===.
    // New reference means "changed" → Angular runs the check.
    this.users = [...this.users, newUser];
  }

  // Bonus: update a single user immutably (same principle)
  updateUserName(id: number, newName: string): void {
    this.users = this.users.map((u: User) =>
      u.id === id ? { ...u, name: newName } : u,
    );
  }
}

// ─────────────────────────────────────────────
// Verification
// ─────────────────────────────────────────────

function verifyImmutableUpdate(): void {
  const original: User[] = [{ id: 1, name: "Alice", email: "a@example.com" }];
  const newUser: User = { id: 2, name: "Bob", email: "b@example.com" };

  const updated: User[] = [...original, newUser];

  const referenceChanged: boolean = original !== updated;
  const lengthCorrect: boolean = updated.length === 2;
  const originalUnchanged: boolean = original.length === 1;

  console.log("Reference changed (required for OnPush):", referenceChanged); // true
  console.log("New array has correct length:", lengthCorrect); // true
  console.log("Original array untouched:", originalUnchanged); // true
}

function verifyObjectImmutableUpdate(): void {
  const original: User = { id: 1, name: "Alice", email: "a@example.com" };
  const updated: User = { ...original, name: "Alicia" };

  console.log("Object reference changed:", original !== updated); // true
  console.log("Name updated:", updated.name); // 'Alicia'
  console.log("Original name unchanged:", original.name); // 'Alice'
}

verifyImmutableUpdate();
verifyObjectImmutableUpdate();

export {
  UserListComponent,
  verifyImmutableUpdate,
  verifyObjectImmutableUpdate,
};
export type { User };
