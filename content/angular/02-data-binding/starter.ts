// DATA BINDING — Starter Exercise
//
// TASK: Implement all four types of data binding in one component.
//
// YOUR TASKS:
// 1. Interpolation: display title, count, and a computed message
// 2. Property binding: disable the "Max" button when count >= max, bind src to avatarUrl
// 3. Event binding: wire up increment/decrement buttons, handle input event to update searchText
// 4. Two-way binding: use [(ngModel)] for the name field (import FormsModule)
// 5. Bonus: bind [style.width.%] to show a progress bar based on count/max

// Assume these imports are available:
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// TODO: Add @Component decorator with selector 'app-data-binding-demo'
// standalone: true, imports: [CommonModule, FormsModule]
export class DataBindingDemoComponent {
  title = "Data Binding Demo";
  count = 0;
  max = 10;
  name = "";
  searchText = "";
  avatarUrl = "https://api.dicebear.com/7.x/initials/svg?seed=AB";

  // TODO: Task 1 — add this template to @Component:
  // - Show title with interpolation
  // - Show count/max as "Count: X / 10"
  // - Show a computed message: "You've reached the max!" when count === max

  // TODO: Task 2 — add buttons:
  // - "Increment" button: disabled when count >= max
  // - "Decrement" button: disabled when count <= 0
  // - An <img> with [src]="avatarUrl"

  // TODO: Task 3 — wire up events:
  increment(): void {
    // TODO: increase count if below max
  }

  decrement(): void {
    // TODO: decrease count if above 0
  }

  onSearchInput(event: Event): void {
    // TODO: update searchText from the input event
  }

  // TODO: Task 4 — add [(ngModel)] for the name field
  // Show "Hello, {name}" below the input (or "Hello, stranger" if name is empty)

  // TODO: Task 5 — computed progress percentage
  get progressPercent(): number {
    // TODO: return count/max * 100
    return 0;
  }
}
