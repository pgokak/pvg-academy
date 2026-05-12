// DECORATORS & ANNOTATIONS — Starter Exercise
//
// PROBLEM: Two plain classes that Angular cannot use.
// No decorators = invisible to the framework.
//
// YOUR TASKS:
// 1. Add the correct Angular decorator to EmailService so it can be injected
//    - It should be available application-wide (root level)
//    - It needs HttpClient injected (add it as a constructor parameter)
//
// 2. Add the correct Angular decorator to UserCardComponent
//    - selector: 'app-user-card'
//    - Use an inline template that displays the user's name and email
//    - Add a button that calls a handleClick() method
//
// 3. Add the correct Angular decorator to HighlightDirective
//    - selector: '[appHighlight]'  (attribute selector)
//    - It should change the background color of the host element on mouseenter
//
// 4. Add the correct Angular decorator to ReversePipe
//    - name: 'reverse'
//    - pure: true

// Assume these imports are available:
// import { Injectable } from '@angular/core';
// import { Component } from '@angular/core';
// import { Directive, HostListener, HostBinding } from '@angular/core';
// import { Pipe, PipeTransform } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

// ─── Task 1: Service ─────────────────────────────────────────────────────────
// TODO: Add @Injectable decorator with providedIn: 'root'
export class EmailService {
  // TODO: inject HttpClient via constructor
  send(to: string, subject: string): void {
    console.log(`Sending "${subject}" to ${to}`);
  }
}

// ─── Task 2: Component ───────────────────────────────────────────────────────
// TODO: Add @Component decorator with:
//   selector: 'app-user-card'
//   standalone: true
//   template: show user.name and user.email, plus a "Select" button
export class UserCardComponent {
  user = { name: "Alice", email: "alice@example.com" };

  handleClick(): void {
    console.log(`Selected user: ${this.user.name}`);
  }
}

// ─── Task 3: Directive ───────────────────────────────────────────────────────
// TODO: Add @Directive decorator with selector: '[appHighlight]'
// TODO: Use @HostBinding to bind to style.backgroundColor
// TODO: Use @HostListener('mouseenter') to set color to 'yellow'
// TODO: Use @HostListener('mouseleave') to clear the color
export class HighlightDirective {
  // TODO: add properties and listeners
}

// ─── Task 4: Pipe ────────────────────────────────────────────────────────────
// TODO: Add @Pipe decorator with name: 'reverse', pure: true
// TODO: Implement PipeTransform interface
export class ReversePipe {
  // TODO: implement transform(value: string): string
  // Reverse the characters in the string
}
