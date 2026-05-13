// Angular View Encapsulation & Performance — Solution
// Commented imports (would resolve in a real Angular project):
// import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

interface ListItem {
  id: number;
  label: string;
  active: boolean;
}

// ─────────────────────────────────────────────
// Solution: Fully optimized component (decorator shown as comment)
// ─────────────────────────────────────────────

// @Component({
//   selector: 'app-item-list',
//
//   // Solution 2: OnPush — only re-check when @Input reference changes
//   changeDetection: ChangeDetectionStrategy.OnPush,
//
//   template: `
//     <!-- Solution 1a: *ngFor with trackBy -->
//     <ul>
//       <li *ngFor="let item of items; trackBy: trackById" [class.active]="item.active">
//         {{ item.label }}
//       </li>
//     </ul>
//
//     <!-- Solution 1b: Angular 17+ @for with built-in track (preferred) -->
//     <!--
//     <ul>
//       @for (item of items; track item.id) {
//         <li [class.active]="item.active">{{ item.label }}</li>
//       }
//     </ul>
//     -->
//
//     <!-- Solution 3: @defer — lazy load HeavyComponent on viewport entry -->
//     @defer (on viewport) {
//       <app-heavy-component [data]="heavyData" />
//     } @loading {
//       <p>Loading...</p>
//     } @error {
//       <p>Failed to load component.</p>
//     }
//   `,
//
//   // ViewEncapsulation.Emulated is the default (not necessary to specify)
//   // encapsulation: ViewEncapsulation.Emulated,
//
//   styles: [`
//     li { padding: 4px 8px; }
//     /* Use CSS custom property for theming — avoids ::ng-deep */
//     li.active { font-weight: bold; color: var(--active-color, green); }
//
//     /* :host to style the root element */
//     :host {
//       display: block;
//     }
//
//     /* :host-context for dark mode */
//     :host-context(.dark-theme) li {
//       color: #ccc;
//     }
//   `]
// })
class ItemListComponent {
  items: ListItem[] = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    label: `Item ${i + 1}`,
    active: i % 5 === 0,
  }));

  heavyData: unknown = { config: "complex" };

  // Solution 1: trackById returns the item's unique id
  // Angular uses this to determine which DOM elements to keep vs recreate
  trackById(_index: number, item: ListItem): number {
    return item.id;
  }
}

// ─────────────────────────────────────────────
// Solution 1: trackById implemented correctly
// ─────────────────────────────────────────────

function trackById(_index: number, item: ListItem): number {
  return item.id; // NOT _index — returning id means Angular knows which items are unchanged
}

// ─────────────────────────────────────────────
// Solution 2 explanation: OnPush (comment only — applied in @Component decorator)
// ─────────────────────────────────────────────

// changeDetection: ChangeDetectionStrategy.OnPush
// Combined with immutable array updates (spread instead of push),
// Angular skips re-checking this component entirely when unrelated
// state changes in ancestor components. Performance impact on 1000-item
// list: from O(n) checks per event → 0 checks unless @Input changes.

// ─────────────────────────────────────────────
// Solution 3: @defer block (shown as comment — Angular template syntax)
// ─────────────────────────────────────────────

// @defer (on viewport) {
//   <app-heavy-component [data]="heavyData" />
// } @loading {
//   <p>Loading...</p>
// } @error {
//   <p>Failed to load component.</p>
// }
//
// What this does:
// - The HeavyComponent JS chunk is NOT included in the main bundle
// - Angular watches the @defer block's position in the viewport using IntersectionObserver
// - Only when the block scrolls into view does Angular download + render HeavyComponent
// - @loading renders immediately while the chunk is being downloaded
// - @error renders if the chunk fails to download (network error, etc.)

// ─────────────────────────────────────────────
// Bonus: Pure pipe (recalculate only when input reference changes)
// ─────────────────────────────────────────────

// @Pipe({ name: 'filterActive', pure: true }) // pure: true is the default
// class FilterActivePipe implements PipeTransform {
//   transform(items: ListItem[]): ListItem[] {
//     return items.filter(item => item.active);
//   }
// }
// Since this is pure, Angular only re-runs it when `items` reference changes.
// With immutable updates (spread/filter/map), this is always correct.

// ─────────────────────────────────────────────
// Verification — all should log true
// ─────────────────────────────────────────────

function verifyTrackBy(): void {
  const items: ListItem[] = [
    { id: 10, label: "A", active: true },
    { id: 20, label: "B", active: false },
    { id: 99, label: "C", active: true },
  ];

  console.log("trackById(0, {id:10}) → 10:", trackById(0, items[0]) === 10); // true
  console.log("trackById(1, {id:20}) → 20:", trackById(1, items[1]) === 20); // true
  console.log("trackById(2, {id:99}) → 99:", trackById(2, items[2]) === 99); // true

  // Key insight: index and id differ → returning id is correct
  console.log(
    "trackById returns id, not index:",
    trackById(0, items[0]) !== 0 && trackById(0, items[0]) === 10,
  ); // true
}

function verifyImmutableListUpdate(): void {
  const original: ListItem[] = [
    { id: 1, label: "Item 1", active: true },
    { id: 2, label: "Item 2", active: false },
  ];

  // Adding item immutably (required for OnPush to detect the change)
  const newItem: ListItem = { id: 3, label: "Item 3", active: true };
  const updated = [...original, newItem];

  console.log("New array reference (OnPush detects):", original !== updated); // true
  console.log("New item added:", updated.length === 3); // true
  console.log("Original unchanged:", original.length === 2); // true

  // Toggling active state immutably
  const toggled = original.map((item) =>
    item.id === 1 ? { ...item, active: !item.active } : item,
  );
  console.log("Toggled reference changed:", original !== toggled); // true
  console.log("Item 1 active toggled:", toggled[0].active === false); // true
}

verifyTrackBy();
verifyImmutableListUpdate();

export { ItemListComponent, trackById };
export type { ListItem };
