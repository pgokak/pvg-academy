// DIRECTIVES — Starter Exercise
//
// TASK: Use structural and attribute directives in a user list component.
//
// YOUR TASKS:
// 1. Use @if (Angular 17+ syntax) to show a "No users" message when users is empty
// 2. Use @for with track to render the user list
// 3. Use [ngClass] to highlight admin users differently from regular users
// 4. Use @switch to render a role badge with different styles per role
// 5. Create a custom AutoFocusDirective that focuses the host element on init
//    selector: '[appAutoFocus]'

// Assume these imports are available:
// import { Component, OnInit, Directive, ElementRef } from '@angular/core';
// import { CommonModule } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "GUEST";
  isActive: boolean;
}

// ─── Task 5: Custom directive ─────────────────────────────────────────────────
// TODO: Implement AutoFocusDirective
// - selector: '[appAutoFocus]'
// - standalone: true
// - inject ElementRef in constructor
// - In ngOnInit: call this.el.nativeElement.focus()

// ─── Main component ───────────────────────────────────────────────────────────
// TODO: Add @Component decorator
// standalone: true, imports: [CommonModule, AutoFocusDirective]
export class UserListComponent {
  users: User[] = [
    {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      role: "ADMIN",
      isActive: true,
    },
    {
      id: 2,
      name: "Bob",
      email: "bob@example.com",
      role: "USER",
      isActive: true,
    },
    {
      id: 3,
      name: "Charlie",
      email: "charlie@example.com",
      role: "GUEST",
      isActive: false,
    },
    {
      id: 4,
      name: "Diana",
      email: "diana@example.com",
      role: "USER",
      isActive: true,
    },
  ];

  showAdminOnly = false;

  get filteredUsers(): User[] {
    return this.showAdminOnly
      ? this.users.filter((u) => u.role === "ADMIN")
      : this.users;
  }

  // TODO: Add the template with:
  // 1. A search input with appAutoFocus
  // 2. A "Show admins only" toggle button
  // 3. @if to show "No users match" when filteredUsers is empty
  // 4. @for to render users with track user.id
  // 5. [ngClass] on each row: { 'admin-row': user.role === 'ADMIN', 'inactive': !user.isActive }
  // 6. @switch for the role badge
}
