// VALIDATION — Starter Exercise
//
// TASK: Build a user registration form using Angular Reactive Forms.
// The form must validate: name (required, min 2 chars), email (required, valid format),
// password (required, min 8 chars), and confirmPassword (must match password).
//
// YOUR TASKS:
// 1. Build the FormGroup with FormBuilder (inject it)
// 2. Add built-in validators to each control
// 3. Write a custom cross-field validator: passwordsMatch
//    - It should be a ValidatorFn applied to the FormGroup (not a single control)
//    - Returns { passwordsMismatch: true } if password !== confirmPassword
//    - Returns null if they match
// 4. Write the template (in the template string) showing:
//    - All four inputs with formControlName
//    - Error messages for each validation rule
//    - Submit button disabled when form is invalid
// 5. Write onSubmit() that only proceeds if form is valid

// Assume these imports are available:
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
// import { ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';

// ─── Task 3: Custom validator ─────────────────────────────────────────────────
// TODO: implement passwordsMatch as a ValidatorFn
// It receives the AbstractControl (the FormGroup) and checks:
//   group.get('password')?.value === group.get('confirmPassword')?.value
export function passwordsMatch(control: unknown): unknown {
  // TODO: implement
  return null;
}

// ─── Tasks 1, 2, 4, 5: Registration Component ────────────────────────────────
// @Component({
//   selector: 'app-registration',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule],
//   template: `
//     <!-- TODO: build the form template here -->
//   `
// })
// export class RegistrationComponent implements OnInit {
//   form!: FormGroup;
//
//   constructor(private fb: FormBuilder) {}
//
//   ngOnInit(): void {
//     // TODO: build FormGroup with FormBuilder
//     // Fields: name, email, password, confirmPassword
//     // Apply passwordsMatch validator to the group level
//   }
//
//   // Convenience getters for template use
//   get name() { return this.form.get('name'); }
//   get email() { return this.form.get('email'); }
//   get password() { return this.form.get('password'); }
//   get confirmPassword() { return this.form.get('confirmPassword'); }
//
//   onSubmit(): void {
//     // TODO: guard against invalid, then log form.value
//   }
// }
