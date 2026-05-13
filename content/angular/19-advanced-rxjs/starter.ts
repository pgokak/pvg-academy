// Angular Advanced RxJS Operators — Starter Exercise
// Commented imports (would resolve in a real Angular project):
// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// RxJS imports (available in the browser/Node RxJS package):
// import { fromEvent, Subject, Observable, forkJoin } from 'rxjs';
// import {
//   debounceTime, distinctUntilChanged, switchMap, mergeMap,
//   forkJoin, takeUntilDestroyed, map, catchError
// } from 'rxjs/operators';
// import { of } from 'rxjs';

// ─────────────────────────────────────────────
// Plain TS simulation of Observable-like behavior (for Monaco execution)
// ─────────────────────────────────────────────

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

// Simulate async search API
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

// Simulate user and posts APIs
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
// TODO 1: Wire up a search pipeline using RxJS operators.
// In a real Angular component, you would:
//   a) Create a Subject<string> for the search input
//   b) Pipe it through: debounceTime(300) → distinctUntilChanged() → switchMap(search API call)
//   c) Subscribe and update this.results
//
// For Monaco: implement the equivalent using Promises and describe
// which operators you'd use in each step.
//
// Question: Why switchMap instead of mergeMap for search?
// Write your answer as a comment:
// ANSWER: ???
// ─────────────────────────────────────────────

// Simulate what debounceTime + distinctUntilChanged + switchMap does:
async function searchWithOperators(terms: string[]): Promise<SearchResult[]> {
  // TODO 1: Simulate the operator chain:
  // - debounceTime: filter out rapid successive terms (keep only the last)
  // - distinctUntilChanged: skip if same as previous
  // - switchMap: cancel previous, run search for the latest term only

  // Hint: in plain async/await, simulate by only using the LAST term in the array
  const lastTerm = terms[terms.length - 1]; // this simulates debounce + switchMap keeping only latest

  // TODO: call mockSearchApi with lastTerm and return the results
  return [];
}

// ─────────────────────────────────────────────
// TODO 2: Implement parallel fetching using forkJoin equivalent.
// Fetch user AND posts in parallel, return them together.
// In RxJS: forkJoin([getUser$(id), getPosts$(id)])
// In plain TS: use Promise.all([...])
// ─────────────────────────────────────────────

async function fetchUserWithPosts(
  userId: number,
): Promise<{ user: User; posts: Post[] }> {
  // TODO: fetch user and posts IN PARALLEL (not sequentially)
  // Hint: Promise.all([mockGetUser(userId), mockGetPosts(userId)])

  // BROKEN (sequential — slower):
  const user = await mockGetUser(userId);
  const posts = await mockGetPosts(userId);
  // Fix this to run in parallel using Promise.all
  return { user, posts };
}

// ─────────────────────────────────────────────
// TODO 3: Describe takeUntilDestroyed cleanup.
// In a real Angular component, what happens if you DON'T unsubscribe
// from a long-running observable when the component is destroyed?
//
// Write your answer as a comment:
// ANSWER: ???
//
// Then write the code pattern for subscribing with cleanup using takeUntilDestroyed:
// (Write it as a comment showing the pipe chain)
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Verification
// ─────────────────────────────────────────────

async function runVerification(): Promise<void> {
  // Test TODO 1
  const terms = ["a", "an", "ang", "angu", "angul", "angula", "angular"];
  const results = await searchWithOperators(terms);
  console.log("Search returned results array:", Array.isArray(results)); // should be true
  // TODO: after your fix, this should log results for "angular" specifically

  // Test TODO 2
  const { user, posts } = await fetchUserWithPosts(1);
  console.log("User fetched:", user.id === 1); // should be true
  console.log("Posts fetched:", posts.length === 2); // should be true
  console.log("Both fetched:", user !== null && posts !== null); // should be true
}

runVerification().then(() => console.log("Verification complete"));

export { searchWithOperators, fetchUserWithPosts };
export type { SearchResult, User, Post };
