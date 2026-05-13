// Angular Advanced RxJS Operators — Solution
// Commented imports (would resolve in a real Angular project):
// import { Component } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { Subject, forkJoin } from 'rxjs';
// import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface SearchResult {
  id: number;
  title: string;
}

interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  userId: number;
  title: string;
}

function mockSearchApi(term: string): Promise<SearchResult[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: `Result for "${term}" #1` },
        { id: 2, title: `Result for "${term}" #2` },
      ]);
    }, 100);
  });
}

function mockGetUser(id: number): Promise<User> {
  return Promise.resolve({ id, name: `User ${id}` });
}

function mockGetPosts(userId: number): Promise<Post[]> {
  return Promise.resolve([
    { id: 1, userId, title: `Post 1 by user ${userId}` },
    { id: 2, userId, title: `Post 2 by user ${userId}` },
  ]);
}

// ─────────────────────────────────────────────
// Solution 1: Full RxJS search pipeline (as comment, for learning)
// ─────────────────────────────────────────────

// In a real Angular component:
// @Component({ ... })
// class SearchComponent {
//   private http = inject(HttpClient);
//   results: SearchResult[] = [];
//
//   // Create a Subject to act as the input stream
//   private searchTerm$ = new Subject<string>();
//
//   constructor() {
//     this.searchTerm$.pipe(
//       debounceTime(300),          // wait 300ms of silence
//       distinctUntilChanged(),     // skip if same as last emission
//       switchMap(term =>           // cancel previous, run latest
//         this.http.get<SearchResult[]>(`/api/search?q=${term}`)
//       ),
//       takeUntilDestroyed()        // auto-unsubscribe when component destroys
//     ).subscribe(results => {
//       this.results = results;
//     });
//   }
//
//   onInput(term: string): void {
//     this.searchTerm$.next(term);
//   }
// }

// Solution 1 answer — why switchMap?
// switchMap cancels the in-flight HTTP request when a new term arrives.
// mergeMap would let all requests run concurrently — the response for "a"
// could arrive AFTER "angular", overwriting the correct results with stale data.
// switchMap guarantees: only the LATEST request's response reaches the subscriber.

async function searchWithOperators(terms: string[]): Promise<SearchResult[]> {
  // Simulate debounce + distinctUntilChanged + switchMap:
  // Only the last unique term matters — all previous are "cancelled"
  const uniqueTerms = [...new Set(terms)];
  const lastTerm = uniqueTerms[uniqueTerms.length - 1];

  // This mirrors switchMap's "cancel previous, run latest" behavior
  return mockSearchApi(lastTerm);
}

// ─────────────────────────────────────────────
// Solution 2: Parallel fetch using Promise.all (forkJoin equivalent)
// ─────────────────────────────────────────────

// In RxJS:
// forkJoin([
//   this.http.get<User>(`/api/users/${id}`),
//   this.http.get<Post[]>(`/api/posts?userId=${id}`)
// ]).subscribe(([user, posts]) => { ... });

async function fetchUserWithPosts(
  userId: number,
): Promise<{ user: User; posts: Post[] }> {
  // Solution: run both requests IN PARALLEL using Promise.all
  // Both requests start at the same time — total wait = max(t_user, t_posts)
  const [user, posts] = await Promise.all([
    mockGetUser(userId),
    mockGetPosts(userId),
  ]);
  return { user, posts };
}

// ─────────────────────────────────────────────
// Solution 3: takeUntilDestroyed pattern (as comment)
// ─────────────────────────────────────────────

// WITHOUT cleanup — memory leak:
// class LeakyComponent {
//   ngOnInit(): void {
//     this.someService.getLiveData$()
//       .subscribe(data => this.data = data);
//     // When component is destroyed, the subscription is still active.
//     // The callback fires, tries to set this.data on a destroyed component.
//     // In long-running SPAs: each navigation to this route adds one more subscription.
//   }
// }

// WITH takeUntilDestroyed — clean:
// class CleanComponent {
//   constructor() {
//     this.someService.getLiveData$()
//       .pipe(takeUntilDestroyed())  // Angular 16+ — ties to DestroyRef automatically
//       .subscribe(data => this.data = data);
//     // When component destroys: subscription automatically unsubscribes. No leak.
//   }
// }

// ─────────────────────────────────────────────
// Verification
// ─────────────────────────────────────────────

async function runVerification(): Promise<void> {
  // Test Solution 1
  const terms = ["a", "an", "ang", "angu", "angul", "angula", "angular"];
  const results = await searchWithOperators(terms);
  console.log("Search returned results array:", Array.isArray(results)); // true
  console.log(
    'Results are for "angular":',
    results[0].title.includes("angular"),
  ); // true

  // Test Solution 2
  const { user, posts } = await fetchUserWithPosts(1);
  console.log("User fetched:", user.id === 1); // true
  console.log("Posts fetched:", posts.length === 2); // true
  console.log("Parallel fetch returned both:", user !== null && posts !== null); // true
}

runVerification().then(() => console.log("All verifications passed"));

export { searchWithOperators, fetchUserWithPosts };
export type { SearchResult, User, Post };
