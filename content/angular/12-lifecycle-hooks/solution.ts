// LIFECYCLE HOOKS — Solution

import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Input,
  inject,
  DestroyRef,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { interval, Subscription } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

interface User {
  id: number;
  name: string;
}

// --- Solution 1: HTTP call moved to ngOnInit ---

@Component({
  selector: "app-user-profile",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="user; else loading">
      <h2>{{ user.name }}</h2>
    </div>
    <ng-template #loading><p>Loading...</p></ng-template>
  `,
})
export class UserProfileComponent implements OnInit {
  @Input({ required: true }) userId!: number;
  user?: User;

  // inject() works in the class body — cleaner than constructor params
  private http = inject(HttpClient);

  // Constructor is ONLY for dependency injection — no side effects
  constructor() {}

  ngOnInit(): void {
    // userId is now set by the parent because Angular applies @Input before ngOnInit
    this.http
      .get<User>(`/api/users/${this.userId}`)
      .subscribe((u) => (this.user = u));
  }
}

// --- Solution 2A: ngOnDestroy + manual Subscription ---

@Component({
  selector: "app-timer-classic",
  standalone: true,
  template: `<p>Count: {{ count }}</p>`,
})
export class TimerClassicComponent implements OnInit, OnDestroy {
  count = 0;
  // Store the subscription so we can cancel it later
  private timerSub!: Subscription;

  ngOnInit(): void {
    this.timerSub = interval(1000).subscribe(() => this.count++);
  }

  ngOnDestroy(): void {
    // Must call unsubscribe — interval() never completes on its own
    this.timerSub.unsubscribe();
  }
}

// --- Solution 2B: DestroyRef + takeUntilDestroyed (modern, no ngOnDestroy) ---

@Component({
  selector: "app-timer-modern",
  standalone: true,
  template: `<p>Count: {{ count }}</p>`,
})
export class TimerModernComponent implements OnInit {
  count = 0;
  // inject() DestroyRef in the class field — injection context is active here
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    interval(1000)
      // takeUntilDestroyed automatically completes the stream when the component is destroyed
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.count++);
    // No ngOnDestroy needed — cleanup is declarative and co-located with the subscription
  }
}

// --- Solution 3: ngOnChanges for @Input reactions ---

@Component({
  selector: "app-chart",
  standalone: true,
  template: `<div class="chart">Chart: {{ data.length }} data points</div>`,
})
export class ChartComponent implements OnChanges {
  @Input() data: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // SimpleChanges has an entry per @Input that changed this cycle
    if (changes["data"]) {
      const prev: number[] = changes["data"].previousValue ?? [];
      const curr: number[] = changes["data"].currentValue;
      // Only redraw if the data actually changed (not on the first run if empty)
      if (curr !== prev) {
        this.redrawChart();
      }
    }
  }

  private redrawChart(): void {
    console.log("Redrawing chart with", this.data.length, "points");
    // Real chart rendering logic would go here
  }
}
