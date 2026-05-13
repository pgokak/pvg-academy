// Angular Custom Validators & Dynamic Forms — Starter Exercise
// Commented imports (would resolve in a real Angular project):
// import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
// import { Observable, of } from 'rxjs';
// import { map } from 'rxjs/operators';

// ─────────────────────────────────────────────
// Minimal type stubs (for plain TS execution without Angular)
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
// TODO 1: Write passwordMatchValidator
// A cross-field validator for a FormGroup.
// It should:
// - Get the 'password' and 'confirmPassword' values from the group
// - Return null if they match (or if either is empty)
// - Return { passwordMismatch: true } if they don't match
// ─────────────────────────────────────────────

function passwordMatchValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const password = group.get("password")?.value as string;
  const confirm = group.get("confirmPassword")?.value as string;

  // TODO: implement the comparison logic
  return null; // replace this
}

// ─────────────────────────────────────────────
// TODO 2: Write a usernameAvailable async validator (simplified for plain TS).
// Given a username string:
// - Return null if the username is NOT in the taken list
// - Return { usernameTaken: true } if it IS in the taken list
// The taken list: ['admin', 'root', 'superuser']
//
// Note: In real Angular this returns Observable<ValidationErrors | null>.
// Here, implement it as a plain function returning ValidationErrors | null.
// ─────────────────────────────────────────────

const TAKEN_USERNAMES: string[] = ["admin", "root", "superuser"];

function checkUsernameAvailable(username: string): ValidationErrors | null {
  // TODO: check if username (case-insensitive) is in TAKEN_USERNAMES
  return null; // replace this
}

// ─────────────────────────────────────────────
// TODO 3: Implement FormArray-like dynamic phone list logic.
// You have a phones array. Implement:
// - addPhone(phones: string[], newPhone: string): string[]  → returns new array with newPhone added
// - removePhone(phones: string[], index: number): string[]  → returns new array with item at index removed
// - validatePhone(phone: string): boolean                   → returns true if phone matches /^\+?[0-9\s\-()]+$/
//
// Key rule: always return a NEW array (immutable update — same principle as FormArray.push)
// ─────────────────────────────────────────────

function addPhone(phones: string[], newPhone: string): string[] {
  // TODO: return a new array with newPhone appended
  return phones; // replace this
}

function removePhone(phones: string[], index: number): string[] {
  // TODO: return a new array with the item at index removed
  return phones; // replace this
}

function validatePhone(phone: string): boolean {
  // TODO: test against /^\+?[0-9\s\-()]+$/
  return false; // replace this
}

// ─────────────────────────────────────────────
// Verification
// ─────────────────────────────────────────────

function verifyPasswordMatch(): void {
  // Matching passwords
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
  ); // should be true

  // Mismatched passwords
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
  ); // should be true
}

function verifyUsernameValidator(): void {
  console.log('"admin" is taken:', checkUsernameAvailable("admin") !== null); // should be true
  console.log('"ADMIN" is taken:', checkUsernameAvailable("ADMIN") !== null); // should be true
  console.log(
    '"alice" is available:',
    checkUsernameAvailable("alice") === null,
  ); // should be true
}

function verifyPhoneArray(): void {
  const phones: string[] = ["+1 555-0100"];

  const withNew = addPhone(phones, "+1 555-0200");
  console.log("addPhone creates new array:", phones !== withNew); // should be true
  console.log("addPhone has 2 items:", withNew.length === 2); // should be true

  const withRemoved = removePhone(withNew, 0);
  console.log("removePhone creates new array:", withNew !== withRemoved); // should be true
  console.log("removePhone has 1 item:", withRemoved.length === 1); // should be true
  console.log("removePhone removed first:", withRemoved[0] === "+1 555-0200"); // should be true

  console.log("valid phone:", validatePhone("+1 555-0100")); // should be true
  console.log("invalid phone:", !validatePhone("not-a-phone")); // should be true
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
