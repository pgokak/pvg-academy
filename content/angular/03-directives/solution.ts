// DIRECTIVES — Solution

import { Component, OnInit, Directive, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";

interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "GUEST";
  isActive: boolean;
}

// ─── Task 5: Custom AutoFocus directive ──────────────────────────────────────
@Directive({
  selector: "[appAutoFocus]",
  standalone: true,
})
export class AutoFocusDirective implements OnInit {
  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    // Focus the host element when the directive initializes
    // setTimeout ensures the element is fully rendered in the DOM
    setTimeout(() => this.el.nativeElement.focus());
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [CommonModule, AutoFocusDirective],
  template: `
    <div class="user-list-container">
      <!-- Task 5: appAutoFocus focuses this input when the component loads -->
      <input
        appAutoFocus
        type="text"
        placeholder="Search users..."
        class="search-input"
      />

      <button (click)="showAdminOnly = !showAdminOnly">
        {{ showAdminOnly ? "Show All" : "Show Admins Only" }}
      </button>

      <!-- Task 1: @if — Angular 17+ syntax -->
      @if (filteredUsers.length === 0) {
        <p class="empty-state">No users match the current filter.</p>
      }

      <!-- Task 2: @for with track — REQUIRED in Angular 17+ -->
      @for (user of filteredUsers; track user.id) {
        <!-- Task 3: [ngClass] — apply multiple classes conditionally -->
        <div
          class="user-row"
          [ngClass]="{
            'admin-row': user.role === 'ADMIN',
            inactive: !user.isActive,
          }"
        >
          <span>{{ user.name }}</span>
          <span class="email">{{ user.email }}</span>

          <!-- Task 4: @switch for role badge -->
          @switch (user.role) {
            @case ("ADMIN") {
              <span class="badge badge-admin">ADMIN</span>
            }
            @case ("USER") {
              <span class="badge badge-user">USER</span>
            }
            @default {
              <span class="badge badge-guest">GUEST</span>
            }
          }

          @if (!user.isActive) {
            <span class="inactive-label">Inactive</span>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .user-list-container {
        padding: 16px;
      }
      .search-input {
        width: 100%;
        padding: 8px;
        margin-bottom: 12px;
      }
      .user-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        border-bottom: 1px solid #eee;
      }
      .admin-row {
        background-color: #fff3cd;
      }
      .inactive {
        opacity: 0.5;
      }
      .email {
        color: #666;
        font-size: 0.875rem;
      }
      .badge {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .badge-admin {
        background: #dc3545;
        color: white;
      }
      .badge-user {
        background: #0d6efd;
        color: white;
      }
      .badge-guest {
        background: #6c757d;
        color: white;
      }
      .inactive-label {
        color: #dc3545;
        font-size: 0.75rem;
      }
      .empty-state {
        color: #666;
        font-style: italic;
      }
    `,
  ],
})
export class UserListComponent {
  users: User[] = [
    {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      role: "ADMIN",
      isActive: true,
    },
    {
      id: 2,
      name: "Bob",
      email: "bob@example.com",
      role: "USER",
      isActive: true,
    },
    {
      id: 3,
      name: "Charlie",
      email: "charlie@example.com",
      role: "GUEST",
      isActive: false,
    },
    {
      id: 4,
      name: "Diana",
      email: "diana@example.com",
      role: "USER",
      isActive: true,
    },
  ];

  showAdminOnly = false;

  get filteredUsers(): User[] {
    return this.showAdminOnly
      ? this.users.filter((u) => u.role === "ADMIN")
      : this.users;
  }
}
