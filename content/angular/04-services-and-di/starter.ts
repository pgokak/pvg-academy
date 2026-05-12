// SERVICES & DEPENDENCY INJECTION — Starter Exercise
//
// TASK: Extract HTTP logic from the component into a proper service.
//
// YOUR TASKS:
// 1. Create UserService with @Injectable({ providedIn: 'root' })
//    Methods:
//    - getUsers(): Observable<User[]>
//    - getUserById(id: number): Observable<User>
//    - createUser(data: CreateUserRequest): Observable<User>
//    - deleteUser(id: number): Observable<void>
//
// 2. Refactor UserListComponent to inject UserService (not HttpClient)
//    - Use inject() syntax (Angular 14+)
//    - Add loading and error state
//
// 3. Implement deleteUser(id) in the component that calls the service

// Assume these imports are available:
// import { Component, OnInit, Injectable, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { CommonModule } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

// ─── Task 1: UserService ──────────────────────────────────────────────────────
// TODO: Implement UserService

// ─── Task 2 & 3: Refactored component ────────────────────────────────────────
// BEFORE (bad — direct HTTP in component):
// @Component({ selector: 'app-user-list', standalone: true, imports: [CommonModule] })
// export class UserListComponent implements OnInit {
//   users: User[] = [];
//   constructor(private http: HttpClient) {}  // BAD: HTTP directly in component
//   ngOnInit(): void {
//     this.http.get<User[]>('/api/users').subscribe(users => this.users = users);
//   }
// }

// TODO: Create the AFTER version:
// - Use inject(UserService) instead of inject(HttpClient)
// - Add isLoading: boolean and error: string state
// - Template: show loading state, error state, user list with delete buttons
// - Implement deleteUser(id: number) that calls userService.deleteUser() and removes from local array
