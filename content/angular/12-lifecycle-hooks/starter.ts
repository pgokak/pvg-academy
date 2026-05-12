// LIFECYCLE HOOKS — Starter Exercise
//
// TASK: Fix two broken components by moving logic to the correct lifecycle hooks.
//
// YOUR TASKS:
// 1. Move the HTTP call from the constructor into ngOnInit() — userId @Input won't be
//    set yet in the constructor
// 2. Fix TimerComponent so it doesn't leak memory:
//    Option A: use ngOnDestroy + Subscription.unsubscribe()
//    Option B (modern): inject DestroyRef and pipe takeUntilDestroyed
// 3. In ChartComponent, use ngOnChanges to detect when [data] changes and call redrawChart()

// Assume these imports are available:
// import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, inject, DestroyRef } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { interval, Subscription } from 'rxjs';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface User {
  id: number;
  name: string;
}

// --- Exercise 1: move HTTP call out of constructor ---
// @Component({ ... })
export class UserProfileComponent implements OnInit {
  @Input({ required: true } as any) userId!: number;
  user?: User;

  // TODO: inject HttpClient (use inject() not constructor param)

  constructor() {
    // BUG: this.userId is undefined here — @Input is not set yet
    // TODO: remove this fetch from the constructor
    // this.http.get<User>(`/api/users/${this.userId}`).subscribe(u => this.user = u);
  }

  ngOnInit(): void {
    // TODO: move the HTTP call here — userId is now available
  }
}

// --- Exercise 2: fix the memory leak ---
// @Component({ ... })
export class TimerComponent implements OnInit {
  count = 0;

  // TODO: Option A — declare a Subscription and unsubscribe in ngOnDestroy
  // TODO: Option B — inject DestroyRef and use takeUntilDestroyed

  ngOnInit(): void {
    // TODO: start interval(1000) and increment count
    // ensure it stops when the component is destroyed
  }

  // TODO (Option A): implement ngOnDestroy
}

// --- Exercise 3: respond to @Input changes ---
// @Component({ ... })
export class ChartComponent implements OnChanges {
  @Input() data: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // TODO: check if changes['data'] exists and call this.redrawChart()
  }

  private redrawChart(): void {
    console.log("Redrawing chart with", this.data.length, "points");
  }
}
