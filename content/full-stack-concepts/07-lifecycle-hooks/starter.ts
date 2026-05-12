// LIFECYCLE HOOKS — Starter Exercise
//
// PROBLEM: The component below has two bugs caused by using the constructor wrong.
// 1. The HTTP call is in the constructor — @Input() userId isn't set yet
// 2. An interval timer is started but never cleaned up — memory leak
//
// YOUR TASKS:
// 1. Move the HTTP call to ngOnInit (add OnInit interface)
// 2. Add ngOnChanges to reload the user when userId @Input changes
// 3. Move the interval to ngOnInit and add ngOnDestroy to clear it
// 4. Implement the OnChanges and OnDestroy interfaces
// 5. Use DestroyRef (Angular 16+) as an alternative to ngOnDestroy for the subscription

// Assume these imports are available:
// import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
// import { Injectable, DestroyRef, inject } from '@angular/core';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { HttpClient } from '@angular/common/http';
// import { Subscription, interval } from 'rxjs';

interface User {
  id: number;
  name: string;
  lastSeen: Date;
}

// ─── BROKEN component — fix this ─────────────────────────────────────────────
// @Component({
//   selector: 'app-user-detail',
//   standalone: true,
//   template: `
//     <div *ngIf="user">
//       <h2>{{ user.name }}</h2>
//       <p>Last seen: {{ lastSeenAgo }}s ago</p>
//     </div>
//   `
// })
// export class UserDetailComponent {
//   @Input() userId!: number;    // Not set when constructor runs!
//   user: User | null = null;
//   lastSeenAgo = 0;
//   private timerInterval: ReturnType<typeof setInterval> | null = null;
//
//   constructor(private http: HttpClient) {
//     // BUG 1: userId is undefined here — HTTP call will fail
//     this.http.get<User>(`/api/users/${this.userId}`).subscribe(u => this.user = u);
//
//     // BUG 2: interval never cleared — memory leak
//     this.timerInterval = setInterval(() => {
//       if (this.user) {
//         const now = Date.now();
//         const last = new Date(this.user.lastSeen).getTime();
//         this.lastSeenAgo = Math.floor((now - last) / 1000);
//       }
//     }, 1000);
//   }
// }

// TODO: Rewrite UserDetailComponent with proper lifecycle hooks:
// - constructor: inject HttpClient only
// - ngOnChanges: detect when userId changes and call loadUser()
// - ngOnInit: start the interval timer
// - ngOnDestroy: clear the interval
// - loadUser(): makes the HTTP call — safe to call after ngOnInit
//
// BONUS: Add a second version (UserDetailV2Component) using:
// - takeUntilDestroyed(destroyRef) instead of ngOnDestroy
// - inject(DestroyRef) instead of implementing OnDestroy
