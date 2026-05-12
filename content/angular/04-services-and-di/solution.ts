// SERVICES & DEPENDENCY INJECTION — Solution

import { Component, OnInit, Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";

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
@Injectable({ providedIn: "root" })
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = "/api/users";

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  createUser(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

// ─── Tasks 2 & 3: Clean component ────────────────────────────────────────────
@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading) {
      <p class="loading">Loading users...</p>
    }
    @if (error) {
      <p class="error">{{ error }}</p>
    }
    @if (!isLoading && !error) {
      @for (user of users; track user.id) {
        <div class="user-row">
          <span>{{ user.name }}</span>
          <span>{{ user.email }}</span>
          <button
            (click)="deleteUser(user.id)"
            [disabled]="deletingId === user.id"
          >
            {{ deletingId === user.id ? "Deleting..." : "Delete" }}
          </button>
        </div>
      } @empty {
        <p>No users found.</p>
      }
    }
  `,
})
export class UserListComponent implements OnInit {
  // inject() syntax — Angular 14+, cleaner than constructor params
  private userService = inject(UserService);

  users: User[] = [];
  isLoading = false;
  error = "";
  deletingId: number | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.error = "";

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Failed to load users. Please try again.";
        this.isLoading = false;
      },
    });
  }

  // Task 3: Delete a user — call service, remove from local array on success
  deleteUser(id: number): void {
    this.deletingId = id;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        // Optimistic update — remove from local array after server confirms
        this.users = this.users.filter((u) => u.id !== id);
        this.deletingId = null;
      },
      error: (err) => {
        this.error = "Failed to delete user.";
        this.deletingId = null;
      },
    });
  }
}
