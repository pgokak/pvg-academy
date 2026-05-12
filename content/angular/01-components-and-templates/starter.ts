// COMPONENTS & TEMPLATES — Starter Exercise
//
// TASK: Build a UserCardComponent that displays a user's info.
//
// YOUR TASKS:
// 1. Add the @Component decorator with:
//    - selector: 'app-user-card'
//    - standalone: true
//    - imports: [CommonModule]
//    - inline template (see Task 2)
//
// 2. Build the template that shows:
//    - User's full name in an <h3>
//    - User's email in a <p>
//    - User's role as a badge <span class="role-badge"> — only show if role !== 'GUEST'
//    - A "Select" button that calls handleSelect()
//    - A "selected" CSS class on the card div when isSelected is true
//
// 3. Implement handleSelect() to toggle isSelected
//
// 4. Add a computed property displayName that returns "name (role)" e.g. "Alice (ADMIN)"

// Assume this import is available:
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "GUEST";
}

// TODO: Add @Component decorator
export class UserCardComponent {
  user: User = {
    id: 1,
    name: "Alice Smith",
    email: "alice@example.com",
    role: "ADMIN",
  };

  isSelected = false;

  // TODO: Implement handleSelect() — toggle isSelected
  handleSelect(): void {
    // TODO
  }

  // TODO: Implement displayName — returns "name (role)"
  get displayName(): string {
    // TODO
    return "";
  }
}
