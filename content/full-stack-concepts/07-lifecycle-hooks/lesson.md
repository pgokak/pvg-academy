---
title: "Lifecycle Hooks"
version: "Full-Stack"
since: 2003
stable: true
---

## The Problem

```typescript
// Angular — calling a service method in the constructor
@Component({ selector: "app-user-profile" })
export class UserProfileComponent {
  user: User | null = null;

  constructor(private userService: UserService) {
    // WRONG: @Input() properties aren't set yet
    // Angular hasn't called ngOnChanges — userId is still undefined
    this.userService.getUser(this.userId).subscribe((u) => (this.user = u));
  }

  @Input() userId!: number; // Not set when constructor runs
}
```

```java
// Spring — calling a service method in the constructor
@Service
public class ReportService {
    @Autowired
    private DataSource dataSource;

    public ReportService() {
        // WRONG: @Autowired hasn't run yet — dataSource is null
        this.connection = dataSource.getConnection(); // NullPointerException!
    }
}
```

Both frameworks inject dependencies before calling lifecycle hooks — but the constructor runs before injection completes. Initialization logic must wait for the right moment.

## Mental Model

The constructor builds the object — it's the carpenter framing a house. The lifecycle hook initializes it — it's the decorator moving in furniture after the house is built. They're two different moments. Don't confuse them.

## Side-by-Side: Angular vs Spring Lifecycle

| Angular Hook      | Spring Equivalent | When it runs                                 | Typical use                   |
| ----------------- | ----------------- | -------------------------------------------- | ----------------------------- |
| `constructor`     | `constructor`     | Object creation, DI not complete             | Declare dependencies only     |
| `ngOnChanges`     | —                 | Before ngOnInit, then on every @Input change | React to new input values     |
| `ngOnInit`        | `@PostConstruct`  | After first ngOnChanges, once                | Load data, setup              |
| `ngAfterViewInit` | —                 | After view + children rendered               | Access ViewChild elements     |
| `ngOnDestroy`     | `@PreDestroy`     | Before component destroyed                   | Cleanup subscriptions, timers |

## Angular Lifecycle in Detail

```typescript
@Component({ selector: "app-user-detail", template: `...` })
export class UserDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userId!: number;
  user: User | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private userService: UserService) {
    // ONLY declare dependencies here
    // Don't call userService.anything() — @Input not ready
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Called whenever @Input properties change (including on first render)
    if (changes["userId"] && !changes["userId"].firstChange) {
      // Reload data when userId changes
      this.loadUser();
    }
  }

  ngOnInit(): void {
    // Called ONCE after first ngOnChanges
    // @Input properties are now set — safe to use this.userId
    this.loadUser();
  }

  private loadUser(): void {
    this.subscription.add(
      this.userService
        .getUser(this.userId)
        .subscribe((user) => (this.user = user)),
    );
  }

  ngOnDestroy(): void {
    // Clean up to prevent memory leaks
    this.subscription.unsubscribe();
  }
}
```

## Spring Lifecycle in Detail

```java
@Service
public class CacheService {
    @Autowired
    private DataSource dataSource;

    private Connection connection;

    // Constructor: DI not complete yet — don't use injected fields
    public CacheService() { }

    // @PostConstruct: All @Autowired fields are now available
    @PostConstruct
    public void init() {
        // Safe — dataSource has been injected
        this.connection = dataSource.getConnection();
        System.out.println("CacheService initialized");
    }

    @PreDestroy
    public void cleanup() {
        // Called when Spring context shuts down
        if (connection != null) {
            connection.close();
        }
        System.out.println("CacheService destroyed");
    }
}
```

## Common Mistake

Calling a service method in the constructor — in both frameworks, injected dependencies may not be fully initialized:

```typescript
// WRONG
constructor(private userService: UserService) {
  this.userService.getUsers().subscribe(...); // May fail — or @Input not ready
}

// RIGHT — use ngOnInit
ngOnInit(): void {
  this.userService.getUsers().subscribe(...); // @Inputs are set, DI is complete
}
```

```java
// WRONG
@Service
public class MyService {
    @Autowired
    private DependentService dep;

    public MyService() {
        dep.doSomething(); // NullPointerException — not injected yet
    }
}

// RIGHT
@PostConstruct
public void init() {
    dep.doSomething(); // dep is injected and ready
}
```

## When to Reach For This

- `ngOnInit` / `@PostConstruct`: load data, set up subscriptions, start timers — anything that needs injected dependencies
- `ngOnDestroy` / `@PreDestroy`: unsubscribe from observables, clear intervals, close connections — memory leak prevention
- `ngOnChanges`: react when an `@Input` changes after the component has rendered
- `ngAfterViewInit`: interact with child elements via `@ViewChild` — template refs are available here
- Any time a constructor is getting "too smart" — move that logic to the appropriate lifecycle hook
