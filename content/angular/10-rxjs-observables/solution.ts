// RXJS & OBSERVABLES — Solution

import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  inject,
  DestroyRef,
} from "@angular/core";
import { fromEvent, of } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  filter,
  catchError,
  takeUntilDestroyed,
} from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { CommonModule, AsyncPipe } from "@angular/common";

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: "app-live-search",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="search-container">
      <input
        #searchInput
        type="text"
        placeholder="Search users..."
        class="search-input"
      />

      <div *ngIf="isSearching" class="loading">Searching...</div>

      <ul class="results-list" *ngIf="!isSearching && searchResults.length > 0">
        <li *ngFor="let user of searchResults" class="result-item">
          <strong>{{ user.name }}</strong>
          <span>{{ user.email }}</span>
        </li>
      </ul>

      <p *ngIf="!isSearching && searchResults.length === 0" class="no-results">
        No results found.
      </p>
    </div>
  `,
  styles: [
    `
      .search-container {
        padding: 16px;
        max-width: 400px;
        font-family: sans-serif;
      }
      .search-input {
        width: 100%;
        padding: 8px 12px;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
      }
      .loading {
        margin-top: 8px;
        color: #666;
        font-style: italic;
      }
      .results-list {
        list-style: none;
        margin: 8px 0 0;
        padding: 0;
        border: 1px solid #eee;
        border-radius: 4px;
      }
      .result-item {
        display: flex;
        flex-direction: column;
        padding: 10px 12px;
        border-bottom: 1px solid #f0f0f0;
      }
      .result-item:last-child {
        border-bottom: none;
      }
      .result-item span {
        color: #666;
        font-size: 0.875rem;
      }
      .no-results {
        margin-top: 8px;
        color: #999;
      }
    `,
  ],
})
export class LiveSearchComponent implements OnInit {
  // Task 1: @ViewChild gives us access to the native input element
  @ViewChild("searchInput", { static: true })
  searchInput!: ElementRef<HTMLInputElement>;

  searchResults: User[] = [];
  isSearching = false;

  // inject() is the modern alternative to constructor injection — works anywhere in an injection context
  private http = inject(HttpClient);
  // DestroyRef fires when the component is destroyed — used with takeUntilDestroyed
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // Task 1: fromEvent creates an Observable from a DOM event
    // Every keystroke emits an InputEvent
    fromEvent<InputEvent>(this.searchInput.nativeElement, "input")
      .pipe(
        // Task 2: map the event to the string value
        map((event) => (event.target as HTMLInputElement).value),

        // Task 2: wait 300ms after the user stops typing before emitting
        // This prevents an API call on every single keystroke
        debounceTime(300),

        // Task 2: only emit if the value actually changed
        // Prevents duplicate calls if user types and deletes to the same string
        distinctUntilChanged(),

        // Filter out empty queries — no point hitting the API with an empty string
        filter((query) => query.trim().length > 0),

        // Task 3: switchMap cancels the previous HTTP request when a new query comes in
        // This prevents stale responses from overwriting newer results
        switchMap((query) => {
          this.isSearching = true;
          return this.http
            .get<User[]>(`/api/users?search=${encodeURIComponent(query)}`)
            .pipe(
              // Task 4: catchError intercepts HTTP errors and returns an empty array
              // of([]) creates an Observable that immediately emits [] and completes
              catchError(() => of<User[]>([])),
            );
        }),

        // Task 5: automatically unsubscribe when the component is destroyed
        // No manual ngOnDestroy or Subscription.unsubscribe() needed
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        // Task 6: update local state with the results
        this.isSearching = false;
        this.searchResults = results;
      });
  }
}
