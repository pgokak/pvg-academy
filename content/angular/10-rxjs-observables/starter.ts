// RXJS & OBSERVABLES — Starter Exercise
//
// TASK: Build a live search component using RxJS operators.
//
// The search input should:
// 1. Debounce keystrokes (300ms) before calling the API
// 2. Skip the API call if the value hasn't changed
// 3. Cancel the previous API call if a new one starts (switchMap)
// 4. Handle errors gracefully (catchError → return empty array)
// 5. Automatically unsubscribe on destroy
//
// YOUR TASKS:
// 1. Create a fromEvent Observable from the search input element
// 2. Pipe: debounceTime(300), distinctUntilChanged(), map(e => e.target.value)
// 3. Pipe: switchMap(query => http.get<User[]>(...).pipe(catchError(() => of([]))))
// 4. Pipe: takeUntilDestroyed(destroyRef)
// 5. Subscribe and assign results to this.searchResults

// Assume these imports are available:
// import { Component, OnInit, ElementRef, ViewChild, inject, DestroyRef } from '@angular/core';
// import { fromEvent, Subject, BehaviorSubject, of, Observable } from 'rxjs';
// import { debounceTime, distinctUntilChanged, switchMap, map, catchError, takeUntilDestroyed } from 'rxjs/operators';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule, AsyncPipe } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
}

// @Component({ ... })
export class LiveSearchComponent implements OnInit {
  // TODO: @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchResults: User[] = [];
  isSearching = false;

  // TODO: inject HttpClient and DestroyRef

  ngOnInit(): void {
    // TODO: Task 1 — create fromEvent observable from this.searchInput.nativeElement
    // TODO: Task 2 — pipe debounceTime(300), distinctUntilChanged(), map to string
    // TODO: filter out empty strings
    // TODO: Task 3 — switchMap to http.get with catchError
    // TODO: Task 4 — takeUntilDestroyed(destroyRef)
    // TODO: Task 5 — subscribe, set isSearching, assign results
  }
}
