---
title: "Custom Validators & Dynamic Forms"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

You need a "confirm password" field. Built-in validators like `Validators.required` and `Validators.minLength` can only inspect one control at a time — they cannot compare two fields. Your form also needs a dynamic list of phone numbers: users can add or remove entries at runtime, so the form has no fixed structure at build time.

```typescript
// Built-in validators can't do this:
// const form = this.fb.group({
//   password: ['', Validators.required],
//   confirmPassword: ['', Validators.required],
//   // How do you validate that confirmPassword === password?
//   // Validators.required doesn't know about sibling controls.
// });
```

## Mental Model

A custom validator is a custom rule on your form — a pure function that inspects the value and either returns `null` (valid) or an error object (invalid). The shape of the error object is up to you; Angular uses it to set `control.errors`.

`FormArray` is an expandable checklist — you can push new rows and remove existing ones at runtime. Each row is its own `FormGroup` or `FormControl` with its own validators.

## Sync Custom Validator — Single Control

```typescript
// import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// A validator is just a function: Control → null | ErrorObject
function forbiddenValueValidator(forbidden: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value as string;
    if (value && value.toLowerCase() === forbidden.toLowerCase()) {
      return { forbiddenValue: { forbidden, actual: value } };
      // The key 'forbiddenValue' becomes control.errors['forbiddenValue']
    }
    return null; // null = valid
  };
}

// Usage:
// const form = this.fb.group({
//   username: ['', [Validators.required, forbiddenValueValidator('admin')]]
// });
```

## Cross-Field Validator on FormGroup

Cross-field validators go on the **FormGroup**, not on individual controls, so they can read multiple sibling values:

```typescript
// import { AbstractControl, ValidationErrors } from '@angular/forms';

function passwordMatchValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const password = group.get("password")?.value as string;
  const confirm = group.get("confirmPassword")?.value as string;

  if (!password || !confirm) return null; // let required validators handle empty

  return password === confirm
    ? null // valid — passwords match
    : { passwordMismatch: true }; // invalid — set error on the group
}

// Apply to the FormGroup:
// const form = this.fb.group(
//   {
//     password: ['', [Validators.required, Validators.minLength(8)]],
//     confirmPassword: ['', Validators.required]
//   },
//   { validators: passwordMatchValidator }  // <-- group-level validator
// );

// Check in template:
// <mat-error *ngIf="form.hasError('passwordMismatch')">Passwords do not match</mat-error>
```

## Async Validator — API Check (e.g., Username Taken)

```typescript
// import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
// import { Observable, of, map, catchError } from 'rxjs';
// import { debounceTime, switchMap, first } from 'rxjs/operators';

function usernameAvailableValidator(
  userService: UserService,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const username = control.value as string;

    if (!username) return of(null);

    // In real code: return userService.checkAvailability(username).pipe(...)
    return of(username).pipe(
      // debounceTime would normally be on the valueChanges stream, not inside the validator
      map((name: string) => {
        const taken = ["admin", "root", "superuser"].includes(
          name.toLowerCase(),
        );
        return taken ? { usernameTaken: true } : null;
      }),
      catchError(() => of(null)), // don't block the form if the API fails
    );
  };
}

// Apply to a control (async validators are the THIRD argument):
// const form = this.fb.group({
//   username: ['', [Validators.required, Validators.minLength(3)], [usernameAvailableValidator(userService)]]
//   //                                                              ^^^ async validators go here
// });
```

## updateOn: 'blur' for Async Validators

Without this, the validator fires an API call on every keystroke:

```typescript
// Fire async validator only when the control loses focus:
// const form = this.fb.group({
//   username: this.fb.control(
//     '',
//     { validators: [Validators.required], asyncValidators: [usernameAvailableValidator(svc)], updateOn: 'blur' }
//   )
// });
// Result: API called once when user tabs away, not on every character
```

## FormArray — Dynamic Lists

```typescript
// import { FormBuilder, FormArray, FormControl } from '@angular/forms';

class RegistrationComponent {
  // fb = inject(FormBuilder);

  // form = this.fb.group({
  //   name: ['', Validators.required],
  //   email: ['', [Validators.required, Validators.email]],
  //   phones: this.fb.array([])           // empty array — rows added dynamically
  // });

  // get phoneArray(): FormArray<FormControl<string>> {
  //   return this.form.get('phones') as FormArray<FormControl<string>>;
  // }

  addPhone(): void {
    // this.phoneArray.push(
    //   this.fb.control<string>('', Validators.pattern(/^\+?[0-9\s\-()]+$/))
    // );
  }

  removePhone(index: number): void {
    // this.phoneArray.removeAt(index);
  }
}

// Template:
// <div *ngFor="let phone of phoneArray.controls; let i = index" [formGroupName]="???">
//   <input [formControl]="phoneArray.at(i)">
//   <button (click)="removePhone(i)">Remove</button>
// </div>
// <button (click)="addPhone()">Add Phone</button>
```

## Iterating FormArray in Template

```typescript
// formArrayName="phones" in template + formControlName for each item:
// <form [formGroup]="form">
//   <div formArrayName="phones">
//     <div *ngFor="let ctrl of phoneArray.controls; let i = index">
//       <input [formControl]="$any(ctrl)" placeholder="Phone {{ i + 1 }}">
//       <mat-error *ngIf="ctrl.hasError('pattern')">Invalid phone format</mat-error>
//       <button (click)="removePhone(i)" type="button">Remove</button>
//     </div>
//   </div>
//   <button (click)="addPhone()" type="button">+ Add Phone</button>
// </form>
```

## Typed Forms (Angular 14+)

```typescript
// import { FormControl, FormGroup, FormArray } from '@angular/forms';

// Strongly typed — TypeScript knows the value type of each control:
// type RegistrationForm = FormGroup<{
//   name: FormControl<string>;
//   email: FormControl<string>;
//   phones: FormArray<FormControl<string>>;
// }>;

// this.form.value.name   → string | null (null when disabled)
// this.phoneArray.at(0).value → string | null
```

## Common Mistake

Adding an async validator alongside sync validators without `updateOn: 'blur'` — the async validator fires an API call on every keystroke while the user is still typing.

```typescript
// BEFORE (fires API on every character):
// username: ['', [Validators.required], [usernameAvailableValidator(svc)]]
// User types "alice" → 5 API calls for 'a', 'al', 'ali', 'alic', 'alice'

// AFTER (fires API only when user leaves the field):
// username: this.fb.control('', {
//   validators: [Validators.required],
//   asyncValidators: [usernameAvailableValidator(svc)],
//   updateOn: 'blur'   // <-- fire on blur, not on every change
// })
// User types "alice" → tabs away → 1 API call for 'alice'
```

## When to Reach For This

- Any form with a "confirm password" or similar cross-field validation requirement
- Username/email availability checks that need an API call
- Dynamic forms where the number of inputs is unknown at build time (phone numbers, team members, line items)
- Multi-step wizards where each step is a separate FormGroup within a parent structure
- Any validation logic that doesn't fit neatly into built-in validators (e.g., conditional required, business rule validation)
