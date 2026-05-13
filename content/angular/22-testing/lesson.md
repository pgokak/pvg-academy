---
title: "Testing Angular Apps"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

The app works perfectly in the browser. A developer refactors the `UserService` to fix a bug — the method signature changes slightly. Three components that depend on `UserService` break silently. Nobody notices until a user reports the issue in production, three days after the release.

```typescript
// Before refactor (old signature):
// getUserById(id: number): Observable<User> { ... }

// After refactor (new signature — breaking change):
// getUser(id: string): Observable<User> { ... }

// UserCardComponent still calls getUserById(this.userId) — TypeScript misses this
// because the component file wasn't changed and the error is only visible at runtime.
// Without tests: this ships to production.
// With tests: the test for UserCardComponent fails immediately during the refactor.
```

## Mental Model

Angular tests are three concentric circles.

**Unit tests** (inner circle) test one class in isolation — no DOM, no HTTP, no Angular DI. Fast and surgical.

**Component tests** (middle circle) test one component with its real template, using Angular's TestBed. The DOM is real; services can be mocked.

**E2E tests** (outer circle) test the full app in a real browser — login, navigate, fill forms. Slow but high confidence.

Most of your tests should be in the middle circle: component tests give you both template and logic coverage without the brittleness of E2E.

## TestBed — Angular's Test DI Container

`TestBed` is to tests what `@NgModule` or `app.config.ts` is to your app — it sets up Angular's DI for the test environment:

```typescript
// import { TestBed, ComponentFixture } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';

// Basic setup pattern:
// describe('UserCardComponent', () => {
//   let fixture: ComponentFixture<UserCardComponent>;
//   let component: UserCardComponent;
//
//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [UserCardComponent],     // standalone component
//       providers: [
//         { provide: UserService, useValue: mockUserService }
//       ]
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(UserCardComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges(); // triggers ngOnInit + first change detection
//   });
//
//   it('renders the user name', () => {
//     component.user = { id: 1, name: 'Alice' };
//     fixture.detectChanges(); // re-run change detection after setting input
//     const nameEl = fixture.nativeElement.querySelector('.user-name');
//     expect(nameEl.textContent).toContain('Alice');
//   });
// });
```

## ComponentFixture — Your Test Handle

```typescript
// ComponentFixture<T> gives you two main handles:
// fixture.componentInstance  → the TypeScript class instance (set @Inputs, call methods)
// fixture.nativeElement      → the root DOM element (query selectors, check text)
// fixture.debugElement       → Angular's wrapper around nativeElement (use By.css() queries)
// fixture.detectChanges()    → runs change detection (MUST call after changing component state)

// Querying the DOM:
// fixture.nativeElement.querySelector('.btn')         → first match
// fixture.nativeElement.querySelectorAll('li')        → all matches
// fixture.debugElement.query(By.css('.btn'))           → Angular debug element
// fixture.debugElement.query(By.directive(MyDirective)) → find by directive
```

## Mocking Services

Never use a real service in component tests — it brings in HTTP, DI chains, and side effects:

```typescript
// import { of } from 'rxjs';

// const mockUserService = {
//   getUser: jasmine.createSpy('getUser').and.returnValue(
//     of({ id: 1, name: 'Alice', email: 'alice@example.com' })
//   ),
//   updateUser: jasmine.createSpy('updateUser').and.returnValue(of(undefined))
// };

// Register in TestBed:
// providers: [
//   { provide: UserService, useValue: mockUserService }
// ]

// Assert it was called:
// expect(mockUserService.getUser).toHaveBeenCalledWith(1);
// expect(mockUserService.getUser).toHaveBeenCalledTimes(1);
```

## HttpClientTestingModule — Intercept HTTP Calls

```typescript
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// describe('UserService', () => {
//   let service: UserService;
//   let httpMock: HttpTestingController;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//       providers: [UserService]
//     });
//     service = TestBed.inject(UserService);
//     httpMock = TestBed.inject(HttpTestingController);
//   });
//
//   afterEach(() => {
//     httpMock.verify(); // assert no unexpected requests were made
//   });
//
//   it('fetches users from /api/users', () => {
//     const mockUsers = [{ id: 1, name: 'Alice' }];
//
//     service.getUsers().subscribe(users => {
//       expect(users).toEqual(mockUsers);
//     });
//
//     const req = httpMock.expectOne('/api/users');
//     expect(req.request.method).toBe('GET');
//     req.flush(mockUsers); // respond with mock data
//   });
// });
```

## Testing Observables: fakeAsync + tick

```typescript
// import { fakeAsync, tick } from '@angular/core/testing';

// fakeAsync lets you control time in tests — no real waiting:
// it('debounces search input by 300ms', fakeAsync(() => {
//   component.searchTerm = 'angular';
//   fixture.detectChanges();
//   tick(299); // 299ms pass — debounce hasn't fired yet
//   expect(component.results).toEqual([]);
//   tick(1);   // 1 more ms — debounce fires
//   expect(component.results.length).toBeGreaterThan(0);
// }));

// done callback — for truly async tests (not fakeAsync-compatible):
// it('loads user async', (done) => {
//   service.getUser(1).subscribe(user => {
//     expect(user.name).toBe('Alice');
//     done();
//   });
// });
```

## Testing @Input and @Output

```typescript
// Testing @Input — set directly on component instance:
// it('displays user name from @Input', () => {
//   component.user = { id: 1, name: 'Bob' };
//   fixture.detectChanges();
//   const el = fixture.nativeElement.querySelector('h2');
//   expect(el.textContent).toContain('Bob');
// });

// Testing @Output — spy on EventEmitter:
// it('emits userSelected when card is clicked', () => {
//   component.user = { id: 1, name: 'Bob' };
//   fixture.detectChanges();
//
//   const spy = spyOn(component.userSelected, 'emit');
//   fixture.nativeElement.querySelector('.card').click();
//   fixture.detectChanges();
//
//   expect(spy).toHaveBeenCalledWith(component.user);
// });
```

## Common Mistake

Forgetting `fixture.detectChanges()` after changing component state — the DOM doesn't update automatically in tests.

```typescript
// BEFORE (broken — DOM is stale):
// it('shows updated name', () => {
//   component.user = { id: 1, name: 'Bob' };
//   // Missing: fixture.detectChanges()
//   const nameEl = fixture.nativeElement.querySelector('.name');
//   expect(nameEl.textContent).toContain('Bob'); // FAILS — DOM still shows old name
// });

// AFTER (correct):
// it('shows updated name', () => {
//   component.user = { id: 1, name: 'Bob' };
//   fixture.detectChanges(); // <-- run change detection, update DOM
//   const nameEl = fixture.nativeElement.querySelector('.name');
//   expect(nameEl.textContent).toContain('Bob'); // passes
// });
```

In a real Angular app, Zone.js triggers change detection automatically. In tests, you are in control — call `fixture.detectChanges()` every time you want the DOM to reflect updated component state.

## When to Reach For This

- After writing any new component — add a basic render test immediately while the structure is fresh
- Before refactoring a service — tests catch breaking changes that TypeScript might miss
- When fixing a bug — write a test that reproduces the bug first, then fix it
- For any component with non-trivial conditional rendering (`*ngIf`, `*ngFor` with filtering)
- For services that transform data — unit tests are fast and exhaustive for pure logic
