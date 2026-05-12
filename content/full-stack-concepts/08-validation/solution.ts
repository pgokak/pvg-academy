// VALIDATION — Solution

import { Component, OnInit } from "@angular/core";
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

// ─── Task 3: Custom cross-field validator ─────────────────────────────────────
// Applied to the FormGroup — it receives the group as the control
// Can read any child control's value via control.get('fieldName')
export const passwordsMatch: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get("password")?.value;
  const confirmPassword = control.get("confirmPassword")?.value;

  // If either field is empty, don't run this validator (let required handle it)
  if (!password || !confirmPassword) return null;

  return password === confirmPassword ? null : { passwordsMismatch: true };
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
        <label for="name">Full Name</label>
        <input
          id="name"
          type="text"
          formControlName="name"
          placeholder="Alice Smith"
        />
        <div class="errors" *ngIf="name?.invalid && name?.touched">
          <span *ngIf="name?.errors?.['required']">Name is required</span>
          <span *ngIf="name?.errors?.['minlength']"
            >At least 2 characters required</span
          >
          <span *ngIf="name?.errors?.['maxlength']">Maximum 50 characters</span>
        </div>
      </div>

      <!-- Email field -->
      <div class="field">
        <label for="email">Email Address</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          placeholder="alice@example.com"
        />
        <div class="errors" *ngIf="email?.invalid && email?.touched">
          <span *ngIf="email?.errors?.['required']">Email is required</span>
          <span *ngIf="email?.errors?.['email']"
            >Please enter a valid email address</span
          >
        </div>
      </div>

      <!-- Password field -->
      <div class="field">
        <label for="password">Password</label>
        <input id="password" type="password" formControlName="password" />
        <div class="errors" *ngIf="password?.invalid && password?.touched">
          <span *ngIf="password?.errors?.['required']"
            >Password is required</span
          >
          <span *ngIf="password?.errors?.['minlength']">
            At least 8 characters (currently {{ password?.value?.length || 0 }})
          </span>
        </div>
      </div>

      <!-- Confirm password field -->
      <div class="field">
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          formControlName="confirmPassword"
        />
        <div class="errors" *ngIf="confirmPassword?.touched">
          <span *ngIf="confirmPassword?.errors?.['required']"
            >Please confirm your password</span
          >
          <!-- Group-level error — access via form.errors, not the control -->
          <span
            *ngIf="form.errors?.['passwordsMismatch'] && confirmPassword?.dirty"
          >
            Passwords do not match
          </span>
        </div>
      </div>

      <!-- Disable submit until all fields are valid -->
      <button type="submit" [disabled]="form.invalid">Create Account</button>

      <!-- Debug helper — remove in production -->
      <pre *ngIf="false">{{ form.value | json }}</pre>
    </form>
  `,
  styles: [
    `
      .form {
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .errors {
        color: #c0392b;
        font-size: 0.875rem;
      }
      input.ng-invalid.ng-touched {
        border-color: #c0392b;
      }
    `,
  ],
})
export class RegistrationComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group(
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
      // Cross-field validator applied at the group level
      { validators: passwordsMatch },
    );
  }

  // Convenience getters — cleaner than form.get('name') in the template
  get name() {
    return this.form.get("name");
  }
  get email() {
    return this.form.get("email");
  }
  get password() {
    return this.form.get("password");
  }
  get confirmPassword() {
    return this.form.get("confirmPassword");
  }

  onSubmit(): void {
    // Guard: mark all fields as touched so errors show on submit attempt
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registrationData } = this.form.value;
    console.log("Registering:", registrationData);
    // this.userService.register(registrationData).subscribe(...)
  }
}
