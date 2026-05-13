---
title: "Advanced RxJS Operators"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

A search box fires an API call on every keystroke. The user types "angular tutorial" — that's 16 characters, 16 requests. Responses arrive out of order: the response for "a" arrives after the response for "angular" and overwrites the results. The user sees wrong data.

```typescript
// BAD: fires a request on every single keystroke, no cancellation
// searchInput.valueChanges.subscribe(term => {
//   this.http.get(`/api/search?q=${term}`).subscribe(results => {
//     this.results = results; // "a" response might arrive AFTER "angular" response
//   });
// });
// Result: race condition — old responses overwrite newer results
```

## Mental Model

RxJS operators are LEGO pieces for async data streams. You compose them to describe exactly what should happen: wait, cancel, merge, queue.

`switchMap` cancels the previous inner observable when a new outer value arrives — like a receptionist who hangs up the old call to answer the new one. `mergeMap` runs all calls at once, like juggling. `concatMap` queues them in order, like a single-lane checkout. `exhaustMap` ignores new requests until the current one finishes, like a bouncer at capacity.

## The Four Flattening Operators

These operators take each value from an outer observable and map it to an inner observable, but they differ in how they handle multiple concurrent inner observables:

```typescript
// import { switchMap, mergeMap, concatMap, exhaustMap } from 'rxjs/operators';

// switchMap — cancel previous, use only latest
// Use for: search, autocomplete, navigation — you only care about the latest
// searchTerm$.pipe(
//   switchMap(term => this.http.get(`/api/search?q=${term}`))
//   // When "ang" arrives before "a" response: "a" request is CANCELLED
// )

// mergeMap — run all concurrently, no cancellation
// Use for: parallel uploads, independent operations that can interleave
// fileSelected$.pipe(
//   mergeMap(file => this.http.post('/api/upload', file))
//   // All uploads run simultaneously — order of completion not guaranteed
// )

// concatMap — queue, run in order (one at a time)
// Use for: sequential saves, operations that must not overlap
// saveAction$.pipe(
//   concatMap(data => this.http.put('/api/save', data))
//   // Each save waits for the previous to complete before starting
// )

// exhaustMap — ignore new values until current inner completes
// Use for: login button, submit button — prevent double submission
// loginClick$.pipe(
//   exhaustMap(() => this.http.post('/api/login', credentials))
//   // Second click while request is in flight: IGNORED
// )
```

## Rate-Limiting: debounceTime and throttleTime

```typescript
// import { debounceTime, throttleTime } from 'rxjs/operators';

// debounceTime(ms) — wait for silence before emitting
// Emits only after the source has been quiet for the given duration.
// Use for: search input (wait for user to stop typing)
// searchInput$.pipe(
//   debounceTime(300) // wait 300ms of silence → emit the latest value
// )
// User types "angular" quickly → 7 keystrokes → only 1 emission after 300ms pause

// throttleTime(ms) — emit at most once per interval
// Emits the first value, then ignores for the given duration.
// Use for: scroll events, resize, button rapid-click protection
// scrollEvent$.pipe(
//   throttleTime(100) // at most 10 scroll emissions per second
// )
```

## distinctUntilChanged — Skip Duplicate Values

```typescript
// import { distinctUntilChanged } from 'rxjs/operators';

// Emits only when the value differs from the previous emission.
// Prevents duplicate API calls when user clears and re-types the same term.
// searchInput$.pipe(
//   debounceTime(300),
//   distinctUntilChanged(), // "angular" → "angula" → "angular" → only 2 emissions
//   switchMap(term => this.http.get(`/api/search?q=${term}`))
// )
```

## Combining Streams: combineLatest and forkJoin

```typescript
// import { combineLatest, forkJoin } from 'rxjs';

// combineLatest([a$, b$]) — emit whenever EITHER changes, with the latest of both
// Use when two streams are ongoing and you need both values at all times.
// combineLatest([this.filters$, this.sortOrder$]).pipe(
//   switchMap(([filters, sort]) => this.http.get('/api/data', { params: { ...filters, sort } }))
// )
// Every time filters OR sortOrder changes, re-fetch

// forkJoin([a$, b$]) — wait for ALL to COMPLETE, emit array of last values
// Use for parallel HTTP calls where you need all results before continuing.
// forkJoin([
//   this.http.get<User>(`/api/users/${id}`),
//   this.http.get<Post[]>(`/api/users/${id}/posts`)
// ]).subscribe(([user, posts]) => {
//   this.user = user;
//   this.posts = posts;
//   // Both requests ran in parallel — total time = max(t_user, t_posts)
// });
```

## withLatestFrom — Sample Another Stream Without Subscribing to It

```typescript
// import { withLatestFrom } from 'rxjs/operators';

// Combines the source emission with the latest value from another stream,
// but only when the source emits — doesn't subscribe to the "other" stream as a trigger.
// saveButton$.pipe(
//   withLatestFrom(this.formValues$),
//   switchMap(([_, formValues]) => this.http.post('/api/save', formValues))
// )
// On each button click: grab the latest formValues and save
```

## takeUntil — Unsubscribe on Component Destroy

```typescript
// import { takeUntil } from 'rxjs/operators';
// import { Subject } from 'rxjs';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Pattern 1: Manual destroy$ subject (older pattern)
// class MyComponent implements OnDestroy {
//   private destroy$ = new Subject<void>();
//
//   ngOnInit(): void {
//     this.someObservable$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(value => { ... });
//   }
//
//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }

// Pattern 2: takeUntilDestroyed() — Angular 16+ (preferred)
// class MyComponent {
//   constructor() {
//     this.someObservable$
//       .pipe(takeUntilDestroyed()) // automatically ties to component lifecycle
//       .subscribe(value => { ... });
//   }
// }
```

## Error Resilience: catchError and retry

```typescript
// import { catchError, retry } from 'rxjs/operators';
// import { EMPTY, of } from 'rxjs';

// retry(3) — resubscribe up to 3 times on error before passing the error downstream
// this.http.get('/api/data').pipe(
//   retry(3)
// )

// catchError — transform or recover from errors
// this.http.get<Product[]>('/api/products').pipe(
//   catchError(err => {
//     console.error('Failed to load products', err);
//     return of([]); // fall back to empty array — stream completes normally
//   })
// )

// EMPTY — complete without emitting (use when you want to swallow but ALWAYS log first)
// this.http.get('/api/data').pipe(
//   catchError(err => {
//     this.errorTracker.log(err); // LOG FIRST — never silently swallow
//     return EMPTY;               // then swallow
//   })
// )
```

## Common Mistake

Using `mergeMap` for search/autocomplete — responses arrive out of order, old results can overwrite newer ones.

```typescript
// BEFORE (broken):
// searchInput$.pipe(
//   mergeMap(term => this.http.get(`/api/search?q=${term}`))
//   // All requests run concurrently — "a" response may arrive after "angular" response
//   // Result: user sees results for "a" instead of "angular"
// )

// AFTER (correct):
// searchInput$.pipe(
//   debounceTime(300),
//   distinctUntilChanged(),
//   switchMap(term => this.http.get(`/api/search?q=${term}`))
//   // Each new term CANCELS the previous request — only latest matters
// )
```

The rule: if only the **latest** result matters, use `switchMap`. If **all results** matter and order doesn't, use `mergeMap`. If **order matters**, use `concatMap`. If you want to **ignore while busy**, use `exhaustMap`.

## When to Reach For This

- Any search or autocomplete input that triggers HTTP calls
- Parallel data fetching where you need all results before rendering (forkJoin)
- Combining filter/sort state with data fetching (combineLatest)
- Long-running subscriptions in components that need cleanup (takeUntilDestroyed)
- Form submissions or login buttons that should not fire twice (exhaustMap)
- Scroll or resize event handlers that fire too frequently (throttleTime)
