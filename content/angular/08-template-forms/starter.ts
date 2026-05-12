// TEMPLATE-DRIVEN FORMS — Starter Exercise
//
// TASK: Build a contact form using template-driven approach.
//
// YOUR TASKS:
// 1. Add ngModel to each input with proper name attribute
// 2. Add built-in validators as HTML attributes (required, email, minlength)
// 3. Show error messages using template reference variables (#fieldName="ngModel")
// 4. Handle form submission — only submit if form is valid
// 5. Reset the form after successful submission

// Assume these imports are available:
// import { Component } from '@angular/core';
// import { FormsModule, NgForm } from '@angular/forms';
// import { CommonModule } from '@angular/common';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phone: string;
}

// TODO: Add @Component decorator
// standalone: true, imports: [FormsModule, CommonModule]
export class ContactFormComponent {
  formData: ContactFormData = {
    name: "",
    email: "",
    message: "",
    phone: "",
  };

  submitted = false;
  submitError = "";

  // TODO: implement onSubmit(form: NgForm)
  // - Guard against invalid form
  // - Log form.value
  // - Set submitted = true
  // - Reset form

  // Template should include:
  // Form fields:
  //   - name: required, minlength="2"
  //   - email: required, email validator
  //   - phone: optional, pattern for digits only: pattern="[0-9]{10}"
  //   - message: required, minlength="20", textarea
  //
  // For each field:
  //   - [(ngModel)]="formData.fieldName"
  //   - name="fieldName"
  //   - Template ref: #fieldName="ngModel"
  //   - Error messages shown when invalid && touched
  //
  // Submit button: [disabled]="form.invalid"
  // Success message: shown when submitted is true
}
