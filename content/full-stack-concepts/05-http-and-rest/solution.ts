// HTTP & REST — Solution

import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

// ─── Task 1: Interfaces ───────────────────────────────────────────────────────
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
}

// ─── Task 2 & 3: UserApiService with error handling ──────────────────────────
@Injectable({ providedIn: "root" })
export class UserApiService {
  private readonly baseUrl = "/api/users";

  constructor(private http: HttpClient) {}

  // GET /api/users → User[]
  getUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  // GET /api/users/:id → User
  getUser(id: number): Observable<User> {
    return this.http
      .get<User>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // POST /api/users → User (Spring returns 201 Created — HttpClient handles it as success)
  createUser(data: CreateUserRequest): Observable<User> {
    return this.http
      .post<User>(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  // PUT /api/users/:id → User (full replacement)
  updateUser(id: number, data: UpdateUserRequest): Observable<User> {
    return this.http
      .put<User>(`${this.baseUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  // PATCH /api/users/:id → User (partial update — only send changed fields)
  patchUser(id: number, data: UpdateUserRequest): Observable<User> {
    return this.http
      .patch<User>(`${this.baseUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  // DELETE /api/users/:id → void (Spring returns 204 No Content)
  deleteUser(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Private error handler — log and rethrow with a user-friendly message
  private handleError(err: HttpErrorResponse): Observable<never> {
    let message = "An unexpected error occurred";

    if (err.status === 0) {
      // Network error — no response from server
      message = "Network error — check your internet connection";
    } else if (err.status === 404) {
      message = "Resource not found";
    } else if (err.status === 400) {
      message = err.error?.message ?? "Invalid request data";
    } else if (err.status === 401) {
      message = "You must be logged in";
    } else if (err.status === 403) {
      message = "You do not have permission";
    } else if (err.status >= 500) {
      message = "Server error — please try again later";
    }

    console.error(`HTTP Error ${err.status}:`, err);
    return throwError(() => new Error(message));
  }
}

// ─── Task 4: Usage example ───────────────────────────────────────────────────
/*
// In a component:
@Component({ ... })
export class UserListComponent implements OnInit {
  users: User[] = [];
  errorMessage = '';

  constructor(private userApi: UserApiService) {}

  ngOnInit(): void {
    // Load all users
    this.userApi.getUsers().subscribe({
      next: users => { this.users = users; },
      error: err => { this.errorMessage = err.message; }
    });
  }

  createUser(): void {
    const data: CreateUserRequest = {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123'
    };
    this.userApi.createUser(data).subscribe({
      next: user => { this.users.push(user); },
      error: err => { this.errorMessage = err.message; }
    });
  }

  deleteUser(id: number): void {
    this.userApi.deleteUser(id).subscribe({
      next: () => { this.users = this.users.filter(u => u.id !== id); },
      error: err => { this.errorMessage = err.message; }
    });
  }
}
*/
