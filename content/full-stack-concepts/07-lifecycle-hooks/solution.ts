// LIFECYCLE HOOKS — Solution

import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  DestroyRef,
  inject,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpClient } from "@angular/common/http";
import { Subscription, interval } from "rxjs";
import { CommonModule } from "@angular/common";

interface User {
  id: number;
  name: string;
  lastSeen: Date;
}

// ─── Fixed component — using lifecycle hooks correctly ───────────────────────
@Component({
  selector: "app-user-detail",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="user">
      <h2>{{ user.name }}</h2>
      <p>Last seen: {{ lastSeenAgo }}s ago</p>
    </div>
    <p *ngIf="!user && isLoading">Loading...</p>
  `,
})
export class UserDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userId!: number; // Will be set by Angular before ngOnInit runs
  user: User | null = null;
  lastSeenAgo = 0;
  isLoading = false;

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private userSubscription: Subscription | null = null;

  // Constructor: ONLY declare dependencies
  // @Input values are NOT set here — they come from Angular's template engine later
  constructor(private http: HttpClient) {}

  // ngOnChanges runs BEFORE ngOnInit and then on EVERY subsequent @Input change
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["userId"] && this.userId) {
      // Don't reload on the firstChange — ngOnInit will handle the initial load
      if (!changes["userId"].firstChange) {
        this.loadUser();
      }
    }
  }

  // ngOnInit: @Input properties are set, DI is complete — safe to start work
  ngOnInit(): void {
    // Initial load — userId is now set
    this.loadUser();

    // Start the interval — it runs while the component is alive
    this.timerInterval = setInterval(() => {
      if (this.user) {
        const now = Date.now();
        const last = new Date(this.user.lastSeen).getTime();
        this.lastSeenAgo = Math.floor((now - last) / 1000);
      }
    }, 1000);
  }

  // ngOnDestroy: runs before Angular destroys the component — clean up everything
  ngOnDestroy(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval); // Stop the timer
    }
    this.userSubscription?.unsubscribe(); // Stop the HTTP subscription
  }

  private loadUser(): void {
    this.isLoading = true;
    this.userSubscription?.unsubscribe(); // Cancel previous request if userId changed

    this.userSubscription = this.http
      .get<User>(`/api/users/${this.userId}`)
      .subscribe({
        next: (user) => {
          this.user = user;
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Failed to load user", err);
          this.isLoading = false;
        },
      });
  }
}

// ─── BONUS: Modern approach with DestroyRef ───────────────────────────────────
// Angular 16+: inject DestroyRef and use takeUntilDestroyed
// No ngOnDestroy interface needed — cleaner code
@Component({
  selector: "app-user-detail-v2",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="user">
      <h2>{{ user.name }}</h2>
    </div>
  `,
})
export class UserDetailV2Component implements OnInit {
  @Input() userId!: number;
  user: User | null = null;

  // inject() works anywhere in the class, not just the constructor
  private destroyRef = inject(DestroyRef);
  private http = inject(HttpClient);

  ngOnInit(): void {
    this.http
      .get<User>(`/api/users/${this.userId}`)
      .pipe(
        // Automatically unsubscribes when the component is destroyed
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((user) => {
        this.user = user;
      });

    // Interval with DestroyRef cleanup
    const sub = interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // update lastSeenAgo
      });
    // No need for ngOnDestroy — takeUntilDestroyed handles it
  }
}
