// Angular Change Detection — Starter Exercise
// Commented imports (would resolve in a real Angular project):
// import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
}

// Simulated async data source (no real Angular DI needed to run this logic)
function fetchUsersAsync(callback: (users: User[]) => void): void {
  setTimeout(() => {
    callback([
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
      { id: 3, name: "Carol", email: "carol@example.com" },
    ]);
  }, 500);
}

// ─────────────────────────────────────────────
// TODO 1: Add OnPush change detection strategy to this component.
//         Uncomment the @Component decorator below and add:
//         changeDetection: ChangeDetectionStrategy.OnPush
// ─────────────────────────────────────────────

// @Component({
//   selector: 'app-user-list',
//   changeDetection: /* TODO: add OnPush strategy here */,
//   template: `
//     <ul>
//       <li *ngFor="let user of users">{{ user.name }} — {{ user.email }}</li>
//     </ul>
//     <button (click)="addUser()">Add User</button>
//   `
// })
class UserListComponent /* implements OnInit */ {
  users: User[] = [{ id: 1, name: "Alice", email: "alice@example.com" }];

  // TODO 2: Inject ChangeDetectorRef
  // private cdr = inject(ChangeDetectorRef);

  // ngOnInit(): void {
  //   this.loadUsersAsync();
  // }

  loadUsersAsync(): void {
    fetchUsersAsync((loadedUsers: User[]) => {
      this.users = loadedUsers;
      // TODO 2 (continued): After assigning this.users, call markForCheck()
      // so OnPush knows to re-check this component on the next cycle.
      // this.cdr.markForCheck();
    });
  }

  addUser(): void {
    const newUser: User = {
      id: this.users.length + 1,
      name: `User ${this.users.length + 1}`,
      email: `user${this.users.length + 1}@example.com`,
    };

    // TODO 3: Fix this broken mutation so OnPush detects the change.
    // The line below MUTATES the array — OnPush will NOT detect this.
    this.users.push(newUser); // BUG: same reference, OnPush skips re-render

    // Replace the line above with an immutable update:
    // this.users = ???
  }
}

// ─────────────────────────────────────────────
// Verification helpers (plain TS, no Angular needed)
// ─────────────────────────────────────────────

function verifyImmutableUpdate(): void {
  const original: User[] = [{ id: 1, name: "Alice", email: "a@example.com" }];
  const newUser: User = { id: 2, name: "Bob", email: "b@example.com" };

  // Simulate what your fixed addUser() should do:
  const updated: User[] = [...original, newUser];

  const referenceChanged: boolean = original !== updated;
  const lengthCorrect: boolean = updated.length === 2;
  const originalUnchanged: boolean = original.length === 1;

  console.log("Reference changed (required for OnPush):", referenceChanged); // should be true
  console.log("New array has correct length:", lengthCorrect); // should be true
  console.log("Original array untouched:", originalUnchanged); // should be true
}

verifyImmutableUpdate();

export { UserListComponent, verifyImmutableUpdate };
export type { User };
