---
title: "Modules & Configuration"
version: "Full-Stack"
since: 2014
stable: true
---

## The Problem

```typescript
// app.component.ts — 800 lines, everything in one place
// HTTP calls, form logic, routing, utility pipes, third-party widgets...
// No clear boundaries. Want to reuse the UserList in another app?
// You can't — it's fused to everything else.
// Want to understand what this app depends on? Good luck.

import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
// ... 30 more imports with no organization
```

Without modules, there's no way to declare what a feature needs, what it exposes, or where its boundaries are. Nothing is reusable.

## Mental Model

A module is a box that declares what it contains and what it needs from outside. It's a self-contained unit of functionality. The box tells you: "I contain these components, I need these services from other boxes, and here's what I'm willing to share."

## Spring Configuration Modules

Spring uses `@Configuration` classes as modules. Each declares a set of beans (objects) that the framework manages.

```java
@Configuration
public class EmailConfiguration {

    @Bean  // "Put this object in the Spring container"
    public JavaMailSender mailSender() {
        SimpleMailMessage sender = new JavaMailSenderImpl();
        sender.setHost("smtp.gmail.com");
        sender.setPort(587);
        return sender;
    }

    @Bean
    @ConditionalOnMissingBean  // Only create this if nothing else provides it
    public EmailTemplateEngine templateEngine() {
        return new FreemarkerEmailTemplateEngine();
    }
}
```

Spring Boot auto-configuration works the same way — it ships hundreds of `@Configuration` classes that activate based on what's on your classpath. Adding `spring-boot-starter-web` activates the web configuration module automatically.

## Angular NgModule (Classic API)

```typescript
@NgModule({
  declarations: [
    // Components, directives, pipes OWNED by this module
    UserListComponent,
    UserCardComponent,
    UserAvatarPipe,
  ],
  imports: [
    // Other modules whose exports this module needs
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  exports: [
    // What this module shares with the outside world
    UserListComponent,
    UserCardComponent,
  ],
  providers: [
    // Services scoped to this module (not application-wide)
    UserService,
  ],
})
export class UserModule {}
```

## Side-by-Side Comparison

| Concept                        | Spring Boot                          | Angular NgModule            |
| ------------------------------ | ------------------------------------ | --------------------------- |
| "I own these objects"          | `@Bean` methods in `@Configuration`  | `declarations: []`          |
| "I need these external things" | Auto-wired via classpath / `@Import` | `imports: []`               |
| "I share these publicly"       | All beans are public by default      | `exports: []`               |
| "Activate based on condition"  | `@ConditionalOnProperty`             | Feature flags / environment |
| Module file                    | `@Configuration` class               | `@NgModule` class           |

## Modern Angular: Standalone Components

Angular 14+ introduced standalone components, which import their dependencies directly — no NgModule needed:

```typescript
// Modern approach — the component declares its own imports
@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [
    CommonModule, // *ngFor, *ngIf
    HttpClientModule, // HttpClient
    UserCardComponent, // Another standalone component
  ],
  template: ` <app-user-card *ngFor="let user of users" [user]="user" /> `,
})
export class UserListComponent {
  constructor(private userService: UserService) {}
}

// app.config.ts — application-level providers (replaces AppModule)
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(), provideAnimations()],
};
```

## Common Mistake

Forgetting to import a module in NgModule — the component just doesn't work with no clear error:

```typescript
// WRONG — HttpClientModule not imported
@NgModule({
  declarations: [UserListComponent],
  imports: [CommonModule], // HttpClientModule missing!
})
export class UserModule {}

// UserListComponent tries to inject HttpClient...
// Runtime error: NullInjectorError: No provider for HttpClient!
// The error message points to HttpClient, not the missing import.

// RIGHT
@NgModule({
  declarations: [UserListComponent],
  imports: [CommonModule, HttpClientModule],
})
export class UserModule {}
```

## When to Reach For This

- Grouping related features together (UserModule, ProductModule, AuthModule)
- When you want to lazy-load a feature — modules/standalone components are the lazy-load boundary
- Controlling which services are application-wide vs feature-scoped
- Sharing reusable UI components as a library (NgModule still makes sense for published packages)
- Using third-party Angular libraries — they ship as NgModules and need to be imported
