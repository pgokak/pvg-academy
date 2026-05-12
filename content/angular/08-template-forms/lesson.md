---
title: "Template-Driven Forms"
version: "Angular 17+"
since: 2016
stable: true
---

## The Problem

```typescript
// Duplicate validation: TypeScript AND template
@Component({})
export class ContactForm {
  validateEmail(email: string): boolean {
    // In TypeScript
    return email.includes("@");
  }
}
// template: <input [class.error]="!validateEmail(email)">
//           AND: <input pattern="[^@]+@[^@]+"> (HTML attribute)
// Same rule in two places — they can drift apart
```

## Mental Model

Template-driven forms let the HTML be the form model. Angular reads the `ngModel` directives and builds the model for you — you don't define `FormControl` objects in TypeScript. Great for simple forms where the template IS the specification.

## Setup and Basic Usage

```typescript
@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <form #form="ngForm" (ngSubmit)="onSubmit(form)">
      <!-- ngModel registers this input with the form -->
      <!-- #email="ngModel" gives access to this control's state -->
      <input
        name="email"
        type="email"
        [(ngModel)]="formData.email"
        #email="ngModel"
        required
        email
        placeholder="Email"
      />

      <!-- Show error only after user has touched the field -->
      <div *ngIf="email.invalid && email.touched">
        <span *ngIf="email.errors?.['required']">Email is required</span>
        <span *ngIf="email.errors?.['email']">Invalid email format</span>
      </div>

      <input
        name="password"
        type="password"
        [(ngModel)]="formData.password"
        #password="ngModel"
        required
        minlength="8"
      />
      <div *ngIf="password.invalid && password.touched">
        <span *ngIf="password.errors?.['minlength']"
          >At least 8 characters</span
        >
      </div>

      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `,
})
export class ContactFormComponent {
  formData = { email: "", password: "" };

  onSubmit(form: NgForm): void {
    if (form.invalid) return;
    console.log(form.value); // { email: '...', password: '...' }
    form.reset();
  }
}
```

## Built-in Validator Attributes

```html
<!-- HTML attributes double as Angular validators when using ngModel -->
required → Validators.required email → Validators.email (Angular attribute, not
HTML5) minlength="8" → Validators.minLength(8) maxlength="50" →
Validators.maxLength(50) pattern="[A-Z].*" → Validators.pattern('[A-Z].*')
min="1" → number minimum max="100" → number maximum
```

## Reactive vs Template-Driven: When to Choose

|                 | Template-Driven    | Reactive                   |
| --------------- | ------------------ | -------------------------- |
| Form defined in | HTML template      | TypeScript class           |
| Validation      | HTML attributes    | Validator functions        |
| Good for        | Simple, few fields | Complex, dynamic, testable |
| Dynamic fields  | Difficult          | Easy (FormArray)           |
| Testing         | Needs DOM          | Pure TypeScript            |
| Type safety     | Limited            | Full (Angular 14+)         |

**Use template-driven when**: Simple contact forms, login forms, settings with few fields
**Use reactive when**: Registration, dynamic field lists, complex cross-field validation

## Common Mistake

Forgetting `name` attribute on inputs — Angular's template forms can't register controls without a name:

```html
<!-- WRONG — missing name attribute, ngModel can't track this -->
<input type="email" [(ngModel)]="email" required />
<!-- Error: If ngModel is used within a form tag, the `name` attribute must be set too -->

<!-- RIGHT -->
<input type="email" name="email" [(ngModel)]="email" required />
```

## When to Reach For This

- Simple login and contact forms — template-driven is faster to write
- Forms where the template IS the spec and requirements won't change often
- Teams more comfortable with HTML than TypeScript
- Quick prototypes and simple admin forms
- Use Reactive Forms instead when: complex validation, dynamic fields, unit testing without DOM
