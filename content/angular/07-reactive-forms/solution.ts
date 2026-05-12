// REACTIVE FORMS — Solution

import { Component, inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from "@angular/forms";
import { CommonModule } from "@angular/common";

// ─── Task 5: Cross-field validator ────────────────────────────────────────────
export const passwordsMatch: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get("password")?.value;
  const confirm = control.get("confirmPassword")?.value;
  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordsMismatch: true };
};

// ─── Registration Component ───────────────────────────────────────────────────
@Component({
  selector: "app-registration",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
      <h2>Create Account</h2>

      <!-- Name field -->
      <div class="field">
        <label>Full Name</label>
        <input formControlName="name" type="text" placeholder="Alice Smith" />
        <div class="hint">{{ name.value?.length || 0 }} / 50 characters</div>
        @if (name.invalid && name.touched) {
          <div class="error" *ngIf="name.errors?.['required']">
            Name is required
          </div>
          <div class="error" *ngIf="name.errors?.['minlength']">
            At least 2 characters
          </div>
          <div class="error" *ngIf="name.errors?.['maxlength']">
            Maximum 50 characters
          </div>
        }
      </div>

      <!-- Email field -->
      <div class="field">
        <label>Email Address</label>
        <input
          formControlName="email"
          type="email"
          placeholder="alice@example.com"
        />
        @if (email.invalid && email.touched) {
          <div class="error" *ngIf="email.errors?.['required']">
            Email is required
          </div>
          <div class="error" *ngIf="email.errors?.['email']">
            Please enter a valid email
          </div>
        }
      </div>

      <!-- Password field -->
      <div class="field">
        <label>Password</label>
        <input formControlName="password" type="password" />
        @if (password.invalid && password.touched) {
          <div class="error" *ngIf="password.errors?.['required']">
            Password is required
          </div>
          <div class="error" *ngIf="password.errors?.['minlength']">
            At least 8 characters ({{ password.value?.length || 0 }} entered)
          </div>
        }
      </div>

      <!-- Confirm password -->
      <div class="field">
        <label>Confirm Password</label>
        <input formControlName="confirmPassword" type="password" />
        @if (confirmPassword.touched) {
          <div class="error" *ngIf="confirmPassword.errors?.['required']">
            Please confirm password
          </div>
          <!-- Group-level error — accessed via form.errors, not the control -->
          <div
            class="error"
            *ngIf="form.errors?.['passwordsMismatch'] && confirmPassword.dirty"
          >
            Passwords do not match
          </div>
        }
      </div>

      <button type="submit" [disabled]="form.invalid">Create Account</button>
    </form>
  `,
})
export class RegistrationComponent {
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group(
    {
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", Validators.required],
    },
    { validators: passwordsMatch },
  );

  // Convenience getters — cleaner in the template
  get name() {
    return this.form.get("name")!;
  }
  get email() {
    return this.form.get("email")!;
  }
  get password() {
    return this.form.get("password")!;
  }
  get confirmPassword() {
    return this.form.get("confirmPassword")!;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Shows all errors if user clicks submit without touching fields
      return;
    }
    const { confirmPassword, ...registrationData } = this.form.value;
    console.log("Registration data:", registrationData);
    // this.authService.register(registrationData).subscribe(...)
  }
}
