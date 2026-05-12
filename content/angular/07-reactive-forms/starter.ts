// REACTIVE FORMS — Starter Exercise
//
// TASK: Build a user registration form with validation.
//
// YOUR TASKS:
// 1. Build a FormGroup with FormBuilder:
//    - name: required, minLength(2), maxLength(50)
//    - email: required, email validator
//    - password: required, minLength(8)
//    - confirmPassword: required
//    - Apply a cross-field validator: passwordsMatch (at group level)
//
// 2. Add convenience getters for each control
//
// 3. Write the template:
//    - All 4 inputs bound with formControlName
//    - Error messages for each validation rule (show when invalid && touched)
//    - Submit button disabled when form is invalid
//    - Character count for name field: "X / 50 characters"
//
// 4. Implement onSubmit(): guard invalid, log form value (without confirmPassword)
//
// 5. Implement a cross-field validator passwordsMatch

// Assume these imports are available:
// import { Component, OnInit, inject } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
// import { ReactiveFormsModule, CommonModule } from '@angular/forms';

// ─── Task 5: Cross-field validator ────────────────────────────────────────────
// TODO: Implement passwordsMatch: ValidatorFn
// Returns { passwordsMismatch: true } if password !== confirmPassword
// Returns null if they match or if either is empty

// ─── Registration Component ───────────────────────────────────────────────────
// TODO: Add @Component decorator
// standalone: true, imports: [ReactiveFormsModule, CommonModule]
export class RegistrationComponent {
  // TODO: inject FormBuilder
  // TODO: build form with all controls and passwordsMatch validator
  // TODO: add getters for name, email, password, confirmPassword
  // TODO: implement onSubmit()
}
