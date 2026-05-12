// DECORATORS & ANNOTATIONS — Solution

// Imports (in a real Angular project these come from @angular/core and @angular/common/http)
import {
  Injectable,
  Component,
  Directive,
  Pipe,
  PipeTransform,
  HostListener,
  HostBinding,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";

// ─── Task 1: Service ─────────────────────────────────────────────────────────
// @Injectable with providedIn: 'root' registers this as an application-wide singleton.
// Angular's DI container creates it once and shares it with everything that needs it.
@Injectable({ providedIn: "root" })
export class EmailService {
  constructor(private http: HttpClient) {}

  send(to: string, subject: string): void {
    console.log(`Sending "${subject}" to ${to}`);
    // In production: this.http.post('/api/emails', { to, subject }).subscribe();
  }
}

// ─── Task 2: Component ───────────────────────────────────────────────────────
// @Component tells Angular:
//   - what HTML tag this maps to (selector)
//   - what HTML to render (template)
//   - what styles to apply
// standalone: true means no NgModule needed
@Component({
  selector: "app-user-card",
  standalone: true,
  template: `
    <div class="user-card">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
      <button (click)="handleClick()">Select</button>
    </div>
  `,
  styles: [
    `
      .user-card {
        border: 1px solid #ccc;
        padding: 16px;
        border-radius: 4px;
      }
    `,
  ],
})
export class UserCardComponent {
  user = { name: "Alice", email: "alice@example.com" };

  handleClick(): void {
    console.log(`Selected user: ${this.user.name}`);
  }
}

// ─── Task 3: Directive ───────────────────────────────────────────────────────
// @Directive attaches behavior to existing elements.
// Usage in template: <p appHighlight>Hover over me</p>
// @HostBinding connects a class property to a DOM property.
// @HostListener listens to DOM events on the host element.
@Directive({
  selector: "[appHighlight]",
  standalone: true,
})
export class HighlightDirective {
  @HostBinding("style.backgroundColor") backgroundColor: string = "";

  @HostListener("mouseenter")
  onMouseEnter(): void {
    this.backgroundColor = "yellow";
  }

  @HostListener("mouseleave")
  onMouseLeave(): void {
    this.backgroundColor = "";
  }
}

// ─── Task 4: Pipe ────────────────────────────────────────────────────────────
// @Pipe makes this class available in templates as {{ value | reverse }}
// pure: true (default) means Angular only re-runs it when the input reference changes
// PipeTransform interface enforces the transform() method signature
@Pipe({
  name: "reverse",
  pure: true,
  standalone: true,
})
export class ReversePipe implements PipeTransform {
  transform(value: string): string {
    return value.split("").reverse().join("");
  }
}

// ─── Usage examples ──────────────────────────────────────────────────────────
// In a template:
//   <app-user-card></app-user-card>
//   <p appHighlight>Hover me</p>
//   <span>{{ 'hello' | reverse }}</span>   → "olleh"
