// DATA BINDING — Solution

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-data-binding-demo",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="demo-container">
      <!-- Task 1: Interpolation — render class properties as text -->
      <h1>{{ title }}</h1>
      <p>Count: {{ count }} / {{ max }}</p>
      <!-- Computed expression in template -->
      <p *ngIf="count === max" class="max-message">You've reached the max!</p>

      <!-- Task 2: Property binding -->
      <div class="controls">
        <!-- [disabled] binds to DOM property — prevents clicking at max -->
        <button [disabled]="count >= max" (click)="increment()">
          Increment
        </button>
        <button [disabled]="count <= 0" (click)="decrement()">Decrement</button>
      </div>

      <!-- Property binding: src and alt bound to class properties -->
      <img [src]="avatarUrl" [alt]="'User avatar'" width="48" height="48" />

      <!-- Task 5: Bonus — progress bar using style binding -->
      <div class="progress-bar">
        <!-- [style.width.%] binds CSS width as a percentage value -->
        <div
          class="progress-fill"
          [style.width.%]="progressPercent"
          [style.background-color]="count === max ? '#f44336' : '#4caf50'"
        ></div>
      </div>
      <p>{{ progressPercent.toFixed(0) }}%</p>

      <!-- Task 3: Event binding — react to click and input events -->
      <div class="search">
        <label>Search (event binding):</label>
        <!-- (input) fires on every keystroke; $event is the native DOM Event -->
        <input
          type="text"
          (input)="onSearchInput($event)"
          [value]="searchText"
          placeholder="Type to search..."
        />
        <p>You typed: {{ searchText }}</p>
      </div>

      <!-- Task 4: Two-way binding — [(ngModel)] keeps input and property in sync -->
      <div class="greeting">
        <label>Name (two-way binding):</label>
        <!-- [(ngModel)] = [value]="name" + (input)="name = $event.target.value" -->
        <input [(ngModel)]="name" placeholder="Enter your name" />
        <p>Hello, {{ name || "stranger" }}!</p>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 16px;
        font-family: sans-serif;
      }
      .controls {
        margin: 8px 0;
        display: flex;
        gap: 8px;
      }
      .max-message {
        color: #f44336;
        font-weight: bold;
      }
      .progress-bar {
        width: 100%;
        height: 12px;
        background: #e0e0e0;
        border-radius: 6px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        transition: width 0.2s;
      }
      .search,
      .greeting {
        margin-top: 16px;
      }
      input {
        margin-left: 8px;
        padding: 4px 8px;
      }
      button {
        padding: 6px 16px;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    `,
  ],
})
export class DataBindingDemoComponent {
  title = "Data Binding Demo";
  count = 0;
  max = 10;
  name = "";
  searchText = "";
  avatarUrl = "https://api.dicebear.com/7.x/initials/svg?seed=AB";

  increment(): void {
    if (this.count < this.max) this.count++;
  }

  decrement(): void {
    if (this.count > 0) this.count--;
  }

  // Event binding: $event is the native InputEvent
  // We must cast event.target to access .value
  onSearchInput(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
  }

  get progressPercent(): number {
    return (this.count / this.max) * 100;
  }
}
