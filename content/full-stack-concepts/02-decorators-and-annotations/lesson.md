---
title: "Decorators & Annotations"
version: "Full-Stack"
since: 2014
stable: true
---

## The Problem

```typescript
// A plain TypeScript class — does nothing special
class UserComponent {
  users: string[] = [];

  loadUsers(): void {
    // Angular has no idea this should render anything
    // No selector, no template, no lifecycle — it's invisible to the framework
  }
}

// A plain Java class
public class UserService {
    private UserRepository repo;
    // Spring has no idea this should be a bean
    // No registration, no injection — Spring ignores it completely
}
```

Both frameworks need a way to mark classes as "special" — as components, services, or controllers — without you having to extend a base class or implement a framework interface for every single type. Annotations and decorators solve this cleanly.

## Mental Model

A decorator or annotation is a sticky note on a class. It tells the framework what role this class plays without changing the class itself. The sticky note says "I'm a service" or "I'm an HTTP controller" — the class still contains only your business logic.

## How They Work

**Java Annotations** use reflection at runtime (and sometimes compile-time processing). Spring scans the classpath, finds annotated classes, and registers them as beans automatically.

**TypeScript Decorators** are functions that run at class definition time. Angular's decorators attach metadata to the class using `Reflect.metadata`. The Angular compiler reads this metadata during the build to wire things up.

Neither mechanism changes your class's runtime behavior directly — they just attach metadata that the framework reads and acts on.

## Side-by-Side: Spring Annotations vs Angular Decorators

| Purpose                    | Spring Boot              | Angular                     |
| -------------------------- | ------------------------ | --------------------------- |
| Mark as injectable service | `@Service`               | `@Injectable`               |
| Mark as HTTP controller    | `@RestController`        | `@Component` (with routing) |
| Mark as component/view     | `@Controller` (MVC view) | `@Component`                |
| Data access layer          | `@Repository`            | —                           |
| Generic bean               | `@Component`             | `@Injectable`               |
| Template pipe/filter       | —                        | `@Pipe`                     |
| DOM attribute behavior     | —                        | `@Directive`                |

**Spring — marking a class as a service:**

```java
@Service  // "I am a service bean — register me in the Spring container"
public class EmailService {
    private final JavaMailSender mailSender;

    // Spring sees @Service + one constructor → auto-inject
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void send(String to, String subject) { /* ... */ }
}
```

**Angular — marking a class as an injectable service:**

```typescript
@Injectable({ providedIn: "root" }) // "Register me in Angular's root injector"
export class EmailService {
  constructor(private http: HttpClient) {}

  send(to: string, subject: string): Observable<void> {
    /* ... */
  }
}
```

The structural intent is identical. The syntax is the framework's way of reading your intent.

## Stereotype Annotations in Spring

Spring has four stereotype annotations that all register beans, but communicate intent:

```java
@Component    // Generic — use when nothing else fits
@Service      // Business logic layer
@Repository   // Data access layer (also translates DB exceptions)
@Controller   // Web layer (returns views)
@RestController  // Web layer (returns JSON — @Controller + @ResponseBody)
```

## Angular Decorator Types

```typescript
@Component({ selector, template, styles })   // Creates a custom HTML element
@Injectable({ providedIn })                  // Injectable service/singleton
@Pipe({ name, pure })                        // Value transformation in templates
@Directive({ selector })                     // Behavior added to existing elements
@NgModule({ declarations, imports, exports }) // Module grouping (classic API)
```

## Common Mistake

Forgetting the decorator entirely — the framework silently ignores the class:

```typescript
// WRONG — no @Injectable, Angular can't inject this
export class AuthService {
  isLoggedIn(): boolean { return false; }
}

// In a component constructor:
constructor(private auth: AuthService) {}
// Runtime error: NullInjectorError: No provider for AuthService!

// RIGHT
@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn(): boolean { return false; }
}
```

In Spring, the equivalent is forgetting `@Service` / `@Component` — Spring's component scan won't pick up the class and injection will fail with `NoSuchBeanDefinitionException`.

## When to Reach For This

- Every class that Angular or Spring should manage — it needs a decorator/annotation
- When you want to communicate the role of a class clearly to other developers (`@Repository` tells you it touches a database)
- When you need framework behavior without inheritance — decorators are composition, not inheritance
- When you want the framework to lifecycle-manage your objects (create, inject, destroy)
- When you want IDE tooling and static analysis to understand the class's purpose
