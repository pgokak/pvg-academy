// HTTP & REST — Starter Exercise
//
// TASK: Implement a complete Angular HTTP service for a User resource.
// The Spring Boot API already exists at /api/users — your job is the client side.
//
// API Contract:
//   GET    /api/users          → User[]
//   GET    /api/users/:id      → User
//   POST   /api/users          → User (201 Created)
//   PUT    /api/users/:id      → User (full replace)
//   PATCH  /api/users/:id      → User (partial update)
//   DELETE /api/users/:id      → void (204 No Content)
//
// YOUR TASKS:
// 1. Define User and CreateUserRequest interfaces
// 2. Implement all 6 methods in UserApiService
// 3. Each method must handle errors with catchError (log and rethrow)
// 4. Write a usage example at the bottom showing how a component would use each method

// Assume these imports are available:
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';

// ─── Task 1: Interfaces ───────────────────────────────────────────────────────
// TODO: Define User interface (id: number, name: string, email: string, role: string)
// TODO: Define CreateUserRequest interface (name: string, email: string, password: string)
// TODO: Define UpdateUserRequest interface (name?: string, email?: string, role?: string)

// ─── Task 2: UserApiService ───────────────────────────────────────────────────
// TODO: Implement UserApiService

// @Injectable({ providedIn: 'root' })
// export class UserApiService {
//   private readonly baseUrl = '/api/users';
//
//   constructor(private http: HttpClient) {}
//
//   // TODO: getUsers(): Observable<User[]>
//
//   // TODO: getUser(id: number): Observable<User>
//
//   // TODO: createUser(data: CreateUserRequest): Observable<User>
//   // Hint: Spring returns 201 Created — HttpClient treats this as success automatically
//
//   // TODO: updateUser(id: number, data: UpdateUserRequest): Observable<User>
//   // Use PUT for full replace
//
//   // TODO: patchUser(id: number, data: UpdateUserRequest): Observable<User>
//   // Use PATCH for partial update
//
//   // TODO: deleteUser(id: number): Observable<void>
// }

// ─── Task 3: Error handling helper ───────────────────────────────────────────
// TODO: Create a private handleError method that:
//   - Logs the error to console
//   - Returns throwError(() => new Error(err.message || 'Server error'))
// Use it in all service methods via .pipe(catchError(this.handleError))

// ─── Task 4: Usage example ───────────────────────────────────────────────────
// TODO: Show how a component would:
//   - Load users on init
//   - Create a new user
//   - Delete a user by id
// (Comment block is fine — just show the subscription pattern)
