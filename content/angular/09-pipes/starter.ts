// PIPES — Starter Exercise
//
// YOUR TASKS:
// 1. Create a TruncatePipe that:
//    - Takes a string, maxLength (default 50), and suffix (default '...')
//    - Returns the string unchanged if it's <= maxLength
//    - Returns string.substring(0, maxLength) + suffix otherwise
//    - Handles null/undefined gracefully
//
// 2. Create a TimeAgoPipe that:
//    - Takes a Date or string
//    - Returns "just now", "5 minutes ago", "3 hours ago", "2 days ago", etc.
//    - Mark as pure: false (must re-run on every change detection cycle to update time)
//
// 3. Write a component that uses:
//    - {{ price | currency:'USD':'symbol':'1.2-2' }}
//    - {{ name | uppercase | truncate:10 }}
//    - {{ createdAt | timeAgo }}
//    - An Observable via async pipe

// Assume these imports are available:
// import { Pipe, PipeTransform, Component, inject } from '@angular/core';
// import { CommonModule, AsyncPipe, CurrencyPipe, UpperCasePipe } from '@angular/common';
// import { Observable, of } from 'rxjs';

// ─── Task 1: TruncatePipe ─────────────────────────────────────────────────────
// @Pipe({ name: 'truncate', pure: true, standalone: true })
// export class TruncatePipe implements PipeTransform {
//   transform(value: string, maxLength = 50, suffix = '...'): string {
//     // TODO
//   }
// }

// ─── Task 2: TimeAgoPipe ──────────────────────────────────────────────────────
// @Pipe({ name: 'timeAgo', pure: false, standalone: true })
// export class TimeAgoPipe implements PipeTransform {
//   transform(value: Date | string): string {
//     // TODO: calculate seconds/minutes/hours/days since value
//     // "just now" < 60s
//     // "X minutes ago" < 60 min
//     // "X hours ago" < 24 hours
//     // "X days ago" otherwise
//   }
// }

// ─── Task 3: Component using the pipes ───────────────────────────────────────
// TODO: Create ProductCardComponent that uses all the pipes
// interface Product { id: number; name: string; price: number; description: string; createdAt: Date; }
