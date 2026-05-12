// COMPONENTS & TEMPLATES — Solution

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "GUEST";
}

@Component({
  selector: "app-user-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- [class.selected]="isSelected" adds 'selected' class when isSelected is true -->
    <div class="user-card" [class.selected]="isSelected">
      <h3>{{ displayName }}</h3>
      <p>{{ user.email }}</p>

      <!-- *ngIf (classic) — hide badge for GUEST users -->
      <span class="role-badge" *ngIf="user.role !== 'GUEST'">
        {{ user.role }}
      </span>

      <!-- Angular 17+ @if syntax (preferred) — same result, better type narrowing -->
      <!-- @if (user.role !== 'GUEST') {
        <span class="role-badge">{{ user.role }}</span>
      } -->

      <button (click)="handleSelect()">
        {{ isSelected ? "Deselect" : "Select" }}
      </button>
    </div>
  `,
  styles: [
    `
      .user-card {
        border: 1px solid #e0e0e0;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 8px;
        transition: border-color 0.2s;
      }
      .user-card.selected {
        border-color: #3f51b5;
        background-color: #f3f4ff;
      }
      .role-badge {
        background: #3f51b5;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
      }
      button {
        margin-top: 8px;
        padding: 6px 16px;
        cursor: pointer;
      }
    `,
  ],
})
export class UserCardComponent {
  user: User = {
    id: 1,
    name: "Alice Smith",
    email: "alice@example.com",
    role: "ADMIN",
  };

  isSelected = false;

  handleSelect(): void {
    this.isSelected = !this.isSelected;
    console.log(
      `User ${this.user.name} is now ${this.isSelected ? "selected" : "deselected"}`,
    );
  }

  // Computed getter — recalculates whenever user or role changes
  get displayName(): string {
    return `${this.user.name} (${this.user.role})`;
  }
}

// ─── Usage in a parent template ───────────────────────────────────────────────
// <app-user-card></app-user-card>
// That's it — the component is self-contained, reusable, and testable
