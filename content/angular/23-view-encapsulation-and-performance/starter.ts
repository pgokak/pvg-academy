// Angular View Encapsulation & Performance — Starter Exercise
// Commented imports (would resolve in a real Angular project):
// import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

// ─────────────────────────────────────────────
// Data types
// ─────────────────────────────────────────────

interface ListItem {
  id: number;
  label: string;
  active: boolean;
}

// ─────────────────────────────────────────────
// The component we'll optimize
// ─────────────────────────────────────────────

// This component renders a list of 1000 items.
// Currently it has several performance and encapsulation issues.

// @Component({
//   selector: 'app-item-list',
//   template: `
//     <!-- TODO 1: Change *ngFor to use trackBy (or rewrite as @for with track) -->
//     <ul>
//       <li *ngFor="let item of items" [class.active]="item.active">
//         {{ item.label }}
//       </li>
//     </ul>
//
//     <!-- TODO 3: Replace this with a @defer block so HeavyComponent is lazy-loaded -->
//     <app-heavy-component [data]="heavyData" />
//   `,
//   styles: [`
//     li { padding: 4px 8px; }
//     li.active { font-weight: bold; color: var(--active-color, green); }
//   `]
//   // TODO 2: Add OnPush change detection strategy
// })
class ItemListComponent {
  items: ListItem[] = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    label: `Item ${i + 1}`,
    active: i % 5 === 0,
  }));

  heavyData: unknown = { config: "complex" };

  // TODO 1: Add a trackBy function named trackById
  // It should return the item's id so Angular can identify unchanged items
  // trackById(_index: number, item: ListItem): number { ... }
}

// ─────────────────────────────────────────────
// TODO 1: Implement trackById for the *ngFor list
// ─────────────────────────────────────────────

function trackById(_index: number, item: ListItem): number {
  // TODO: return item.id
  return _index; // BROKEN: using index means no optimization — replace with item.id
}

// TODO 2: Describe (as a comment) what you'd add to the @Component decorator to enable OnPush.
// Refer to lesson 16 if needed.

// TODO 2 answer:
// changeDetection: ???

// ─────────────────────────────────────────────
// TODO 3: Write a @defer block for HeavyComponent (as a comment).
// It should:
// - Defer loading until the element is in the viewport
// - Show a "Loading..." placeholder while loading
// - Show "Failed to load" if an error occurs
// ─────────────────────────────────────────────

// TODO 3 answer (write as comment):
// @defer (???) {
//   ???
// } @loading {
//   ???
// } @error {
//   ???
// }

// ─────────────────────────────────────────────
// Verification helpers
// ─────────────────────────────────────────────

function verifyTrackBy(): void {
  const items: ListItem[] = [
    { id: 10, label: "A", active: true },
    { id: 20, label: "B", active: false },
  ];

  // trackById should return the item's id, NOT the index
  const resultAt0 = trackById(0, items[0]);
  const resultAt1 = trackById(1, items[1]);

  console.log(
    "trackById returns item.id (not index):",
    resultAt0 === 10 && resultAt1 === 20,
  ); // should be true
  console.log("trackById(0, {id:10}) → 10:", resultAt0 === 10); // should be true
  console.log("trackById(1, {id:20}) → 20:", resultAt1 === 20); // should be true
}

function verifyEncapsulation(): void {
  // ViewEncapsulation mode constants (numeric values from Angular)
  const EMULATED = 2; // default
  const NONE = 3;
  const SHADOW_DOM = 1;

  console.log("Emulated is the default mode:", EMULATED === 2); // true — just a sanity check
  console.log("None makes styles global:", NONE === 3); // true
  console.log("ShadowDom uses native browser API:", SHADOW_DOM === 1); // true
}

verifyTrackBy();
verifyEncapsulation();

export { ItemListComponent, trackById };
export type { ListItem };
