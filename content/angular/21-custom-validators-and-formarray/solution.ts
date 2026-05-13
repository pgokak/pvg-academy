// Angular Custom Validators & Dynamic Forms — Solution
// Commented imports (would resolve in a real Angular project):
// import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
// import { Observable, of } from 'rxjs';
// import { map } from 'rxjs/operators';

// ─────────────────────────────────────────────
// Type stubs (same as starter, for plain TS execution)
// ─────────────────────────────────────────────

interface ValidationErrors {
  [key: string]: unknown;
}

interface AbstractControl {
  value: unknown;
  get(name: string): AbstractControl | null;
}

type ValidatorFn = (control: AbstractControl) => ValidationErrors | null;

// ─────────────────────────────────────────────
// Solution 1: passwordMatchValidator — cross-field group validator
// ─────────────────────────────────────────────

function passwordMatchValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const password = group.get("password")?.value as string;
  const confirm = group.get("confirmPassword")?.value as string;

  // Don't error if either field is empty — required validator handles that
  if (!password || !confirm) return null;

  // Compare values; return error object or null
  return password === confirm ? null : { passwordMismatch: true };
}

// Real Angular usage:
// const form = this.fb.group(
//   {
//     password: ['', [Validators.required, Validators.minLength(8)]],
//     confirmPassword: ['', Validators.required],
//   },
//   { validators: passwordMatchValidator }
// );
// Template: <mat-error *ngIf="form.hasError('passwordMismatch')">Passwords do not match</mat-error>

// ─────────────────────────────────────────────
// Solution 2: checkUsernameAvailable — async validator logic
// ─────────────────────────────────────────────

const TAKEN_USERNAMES: string[] = ["admin", "root", "superuser"];

function checkUsernameAvailable(username: string): ValidationErrors | null {
  // Case-insensitive check — 'ADMIN' and 'admin' are both taken
  const isTaken = TAKEN_USERNAMES.includes(username.toLowerCase());
  return isTaken ? { usernameTaken: true } : null;
}

// Real Angular async validator:
// function usernameAvailableValidator(userService: UserService): AsyncValidatorFn {
//   return (control: AbstractControl): Observable<ValidationErrors | null> => {
//     if (!control.value) return of(null);
//     return userService.isUsernameTaken(control.value as string).pipe(
//       map(taken => (taken ? { usernameTaken: true } : null)),
//       catchError(() => of(null)) // don't block form on API failure
//     );
//   };
// }
//
// Applied with updateOn: 'blur':
// username: this.fb.control('', {
//   validators: [Validators.required],
//   asyncValidators: [usernameAvailableValidator(svc)],
//   updateOn: 'blur'
// })

// ─────────────────────────────────────────────
// Solution 3: FormArray-like phone list operations — immutable updates
// ─────────────────────────────────────────────

function addPhone(phones: string[], newPhone: string): string[] {
  // Spread creates a new array — mirrors FormArray.push() creating a new control
  return [...phones, newPhone];
}

function removePhone(phones: string[], index: number): string[] {
  // Filter by index — mirrors FormArray.removeAt(index)
  return phones.filter((_, i) => i !== index);
}

function validatePhone(phone: string): boolean {
  return /^\+?[0-9\s\-()]+$/.test(phone);
}

// Real Angular FormArray usage:
// get phoneArray(): FormArray<FormControl<string>> {
//   return this.form.get('phones') as FormArray<FormControl<string>>;
// }
//
// addPhone(): void {
//   this.phoneArray.push(
//     this.fb.control<string>('', { validators: [phoneValidator] })
//   );
// }
//
// removePhone(index: number): void {
//   this.phoneArray.removeAt(index);
// }

// ─────────────────────────────────────────────
// Verification — all should log true
// ─────────────────────────────────────────────

function verifyPasswordMatch(): void {
  const matchingGroup: AbstractControl = {
    value: null,
    get: (name: string) => ({
      value: name === "password" ? "Secret123" : "Secret123",
      get: () => null,
    }),
  };
  console.log(
    "Matching passwords → null:",
    passwordMatchValidator(matchingGroup) === null,
  ); // true

  const mismatchGroup: AbstractControl = {
    value: null,
    get: (name: string) => ({
      value: name === "password" ? "Secret123" : "Different!",
      get: () => null,
    }),
  };
  const result = passwordMatchValidator(mismatchGroup);
  console.log(
    "Mismatched → has error:",
    result !== null && "passwordMismatch" in result,
  ); // true
}

function verifyUsernameValidator(): void {
  console.log('"admin" is taken:', checkUsernameAvailable("admin") !== null); // true
  console.log('"ADMIN" is taken:', checkUsernameAvailable("ADMIN") !== null); // true
  console.log('"root" is taken:', checkUsernameAvailable("root") !== null); // true
  console.log(
    '"alice" is available:',
    checkUsernameAvailable("alice") === null,
  ); // true
}

function verifyPhoneArray(): void {
  const phones: string[] = ["+1 555-0100"];

  const withNew = addPhone(phones, "+1 555-0200");
  console.log("addPhone creates new array:", phones !== withNew); // true
  console.log("addPhone has 2 items:", withNew.length === 2); // true

  const withRemoved = removePhone(withNew, 0);
  console.log("removePhone creates new array:", withNew !== withRemoved); // true
  console.log("removePhone has 1 item:", withRemoved.length === 1); // true
  console.log("removePhone kept second:", withRemoved[0] === "+1 555-0200"); // true

  console.log("valid phone (+1 555-0100):", validatePhone("+1 555-0100")); // true
  console.log("valid phone (555 1234):", validatePhone("555 1234")); // true
  console.log("invalid phone (not-a-phone):", !validatePhone("not-a-phone")); // true
}

verifyPasswordMatch();
verifyUsernameValidator();
verifyPhoneArray();

export {
  passwordMatchValidator,
  checkUsernameAvailable,
  addPhone,
  removePhone,
  validatePhone,
};
export type { ValidationErrors, AbstractControl, ValidatorFn };
