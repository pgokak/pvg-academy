---
title: "Reactive Forms"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```typescript
// Tracking form state manually — imperative and fragile
@Component({ template: `...` })
export class LoginComponent {
  email = "";
  password = "";
  emailError = "";

  onEmailChange(value: string): void {
    this.email = value;
    this.emailError = value.includes("@") ? "" : "Invalid email"; // Manual validation
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      // Manual validity check
      return;
    }
    // Submit
  }
  // 3 form fields → 9 state variables, 6 change handlers, 6 validation checks
}
```

## Mental Model

A reactive form is a model of your form in TypeScript. The template just mirrors the model — you work with the model, not the DOM. Change the model → template updates. User types → model updates. Validate the model → know the form's state.

## FormGroup, FormControl, FormBuilder

```typescript
@Component({ ... })
export class LoginComponent {
  private fb = inject(FormBuilder);

  // FormGroup = a group of controls
  form = this.fb.group({
    // FormControl(initialValue, [validators])
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  // Convenience getters — cleaner than form.get('email') in the template
  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Show all errors
      return;
    }
    console.log(this.form.value); // { email: '...', password: '...' }
  }
}
```

## Template Binding

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <div>
    <input formControlName="email" type="email" placeholder="Email" />
    <!-- Show errors only when field has been touched -->
    @if (email.invalid && email.touched) {
    <span *ngIf="email.errors?.['required']">Email is required</span>
    <span *ngIf="email.errors?.['email']">Invalid email format</span>
    }
  </div>

  <div>
    <input formControlName="password" type="password" placeholder="Password" />
    @if (password.invalid && password.touched) {
    <span *ngIf="password.errors?.['minlength']">
      At least 8 characters ({{ password.value?.length || 0 }} entered)
    </span>
    }
  </div>

  <!-- Disabled when form is invalid -->
  <button type="submit" [disabled]="form.invalid">Login</button>
</form>
```

## Typed Forms (Angular 14+)

```typescript
// TypeScript knows the shape of form.value
interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

form = new FormGroup<LoginForm>({
  email: new FormControl("", {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  }),
  password: new FormControl("", {
    nonNullable: true,
    validators: [Validators.required],
  }),
});

// form.value is typed as { email: string; password: string }
// No any, no type assertions needed
```

## FormArray — Dynamic Fields

```typescript
form = this.fb.group({
  name: ['', Validators.required],
  phones: this.fb.array([
    this.fb.control('', Validators.required)
  ])
});

get phones() { return this.form.get('phones') as FormArray; }

addPhone(): void {
  this.phones.push(this.fb.control('', Validators.required));
}

removePhone(index: number): void {
  this.phones.removeAt(index);
}
```

## Common Mistake

Using `form.value` when the form has disabled controls — `.value` omits them. Use `.getRawValue()`:

```typescript
// WRONG — if email is disabled, form.value won't have email
const data = this.form.value;

// RIGHT — includes all controls regardless of disabled state
const data = this.form.getRawValue();
```

## When to Reach For This

- Complex forms with validation — reactive forms give you fine-grained control
- Dynamic forms (adding/removing fields) — FormArray
- Real-time validation feedback as user types — subscribe to `valueChanges`
- Cross-field validation (password === confirmPassword) — custom group validator
- Programmatic form control (reset, patch values, disable fields) — form model API
