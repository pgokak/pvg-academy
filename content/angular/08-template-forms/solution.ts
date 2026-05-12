// TEMPLATE-DRIVEN FORMS — Solution

import { Component } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { CommonModule } from "@angular/common";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phone: string;
}

@Component({
  selector: "app-contact-form",
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <!-- Success message — shown after submission -->
    @if (submitted) {
      <div class="success-banner">
        Message sent successfully! We'll respond within 24 hours.
        <button (click)="submitted = false">Send another</button>
      </div>
    }

    <!-- #form="ngForm" gives us a reference to the NgForm directive -->
    <!-- (ngSubmit) is preferred over (submit) for Angular forms -->
    <form #form="ngForm" (ngSubmit)="onSubmit(form)" *ngIf="!submitted">
      <h2>Contact Us</h2>

      <!-- Name field: required + minlength validator via HTML attribute -->
      <div class="field">
        <label for="name">Full Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          [(ngModel)]="formData.name"
          #name="ngModel"
          required
          minlength="2"
          placeholder="Alice Smith"
          [class.error-input]="name.invalid && name.touched"
        />
        <div class="errors" *ngIf="name.invalid && name.touched">
          <span *ngIf="name.errors?.['required']">Name is required</span>
          <span *ngIf="name.errors?.['minlength']"
            >At least 2 characters required</span
          >
        </div>
      </div>

      <!-- Email field: required + email validator (Angular's, not HTML5) -->
      <div class="field">
        <label for="email">Email Address *</label>
        <input
          id="email"
          name="email"
          type="email"
          [(ngModel)]="formData.email"
          #email="ngModel"
          required
          email
          placeholder="alice@example.com"
        />
        <div class="errors" *ngIf="email.invalid && email.touched">
          <span *ngIf="email.errors?.['required']">Email is required</span>
          <span *ngIf="email.errors?.['email']"
            >Please enter a valid email</span
          >
        </div>
      </div>

      <!-- Phone: optional but must be 10 digits if provided -->
      <div class="field">
        <label for="phone">Phone (optional)</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          [(ngModel)]="formData.phone"
          #phone="ngModel"
          pattern="[0-9]{10}"
          placeholder="5551234567"
        />
        <div class="errors" *ngIf="phone.invalid && phone.touched">
          <span *ngIf="phone.errors?.['pattern']"
            >Must be exactly 10 digits</span
          >
        </div>
      </div>

      <!-- Message: textarea with required and minlength -->
      <div class="field">
        <label for="message">Message *</label>
        <textarea
          id="message"
          name="message"
          [(ngModel)]="formData.message"
          #message="ngModel"
          required
          minlength="20"
          rows="5"
          placeholder="Describe your inquiry..."
        ></textarea>
        <div class="hint">{{ formData.message.length }} / 20+ characters</div>
        <div class="errors" *ngIf="message.invalid && message.touched">
          <span *ngIf="message.errors?.['required']">Message is required</span>
          <span *ngIf="message.errors?.['minlength']"
            >Please write at least 20 characters</span
          >
        </div>
      </div>

      <!-- Disabled when form is invalid -->
      <button type="submit" [disabled]="form.invalid">Send Message</button>
    </form>
  `,
})
export class ContactFormComponent {
  formData: ContactFormData = {
    name: "",
    email: "",
    message: "",
    phone: "",
  };

  submitted = false;

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      // Mark all fields touched to show errors if user clicks submit early
      Object.keys(form.controls).forEach((key) => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    console.log("Contact form submitted:", form.value);
    // this.contactService.submit(form.value).subscribe(...)

    this.submitted = true;
    form.reset(); // Resets values AND validation state (touched, dirty)
    this.formData = { name: "", email: "", message: "", phone: "" };
  }
}
