---
title: "AOP & Cross-Cutting Concerns"
version: "Spring Boot 3.x"
since: 2004
stable: true
---

## The Problem

```java
// Same 5-line block copy-pasted into 50 service methods
@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public Order placeOrder(OrderRequest request) {
        log.info("Entering placeOrder with args: {}", request);     // duplicated
        long start = System.currentTimeMillis();                      // duplicated
        try {
            Order result = doPlaceOrder(request);
            log.info("placeOrder took {}ms", System.currentTimeMillis() - start); // duplicated
            return result;
        } catch (Exception e) {
            log.error("placeOrder threw: {}", e.getMessage());        // duplicated
            throw e;
        }
    }
}
// Change the log format = change 50 files. Add a new concern = another 50 edits.
```

Cross-cutting concerns (logging, timing, security checks, auditing) repeated across every class.

## Mental Model

AOP is a ninja who intercepts method calls without the method knowing. You define "when X method in Y package is called, also do Z" — the method stays clean, Z runs automatically. The method never imports, never calls, and never knows about the ninja.

## Terminology

| Term          | Meaning                                                             |
| ------------- | ------------------------------------------------------------------- |
| **Aspect**    | The class containing the cross-cutting logic (`@Aspect @Component`) |
| **JoinPoint** | A method execution — the moment the ninja can intercept             |
| **Pointcut**  | A predicate that selects which JoinPoints to intercept              |
| **Advice**    | The actual code that runs at a JoinPoint (before, after, around)    |
| **Weaving**   | Spring generating a proxy at startup that wraps the target bean     |

## Advice Types

```java
@Aspect
@Component
public class LoggingAspect {

    // @Before — runs before the method executes
    @Before("execution(* com.example.service.*.*(..))")
    public void logMethodEntry(JoinPoint joinPoint) {
        log.info("Entering: {}.{}() with args: {}",
            joinPoint.getTarget().getClass().getSimpleName(),
            joinPoint.getSignature().getName(),
            Arrays.toString(joinPoint.getArgs()));
    }

    // @After — runs after the method, always (even if it throws)
    @After("execution(* com.example.service.*.*(..))")
    public void logMethodExit(JoinPoint joinPoint) {
        log.info("Exited: {}", joinPoint.getSignature().getName());
    }

    // @AfterReturning — runs only on successful return; can access the return value
    @AfterReturning(
        pointcut = "execution(* com.example.service.*.*(..))",
        returning = "result")
    public void logReturnValue(JoinPoint joinPoint, Object result) {
        log.info("{} returned: {}", joinPoint.getSignature().getName(), result);
    }

    // @AfterThrowing — runs only when the method throws; can access the exception
    @AfterThrowing(
        pointcut = "execution(* com.example.service.*.*(..))",
        throwing = "exception")
    public void logException(JoinPoint joinPoint, Exception exception) {
        log.error("{} threw: {}", joinPoint.getSignature().getName(), exception.getMessage());
    }

    // @Around — wraps the entire method; most powerful; MUST call proceed()
    @Around("execution(* com.example.service.*.*(..))")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();  // MUST call this — executes the actual method
        long duration = System.currentTimeMillis() - start;
        log.info("{} executed in {}ms", joinPoint.getSignature().getName(), duration);
        return result;
    }
}
```

## Pointcut Expressions

```java
// All methods in any class in the service package
"execution(* com.example.service.*.*(..))"

// All methods in UserService specifically
"execution(* com.example.service.UserService.*(..))"

// All public methods returning String anywhere in the app
"execution(public String com.example..*.*(..))"

// Match by annotation — only methods annotated with @Loggable
"@annotation(com.example.annotation.Loggable)"

// Reusable named pointcut
@Pointcut("execution(* com.example.service.*.*(..))")
public void serviceLayer() {}

@Before("serviceLayer()")
public void beforeService(JoinPoint jp) { ... }
```

## Custom Annotation — Mark Methods for AOP

```java
// 1. Define the annotation
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Loggable {
    String value() default "";  // Optional description
}

// 2. Apply it selectively
@Service
public class PaymentService {

    @Loggable("process payment")
    public Receipt processPayment(PaymentRequest request) { ... }

    public void internalHelper() { ... }  // Not logged
}

// 3. Intercept it in the aspect
@Around("@annotation(loggable)")
public Object logAnnotatedMethod(ProceedingJoinPoint jp, Loggable loggable) throws Throwable {
    log.info("Starting: {} ({})", jp.getSignature().getName(), loggable.value());
    long start = System.currentTimeMillis();
    Object result = jp.proceed();
    log.info("Completed: {} in {}ms", jp.getSignature().getName(),
        System.currentTimeMillis() - start);
    return result;
}
```

## Practical Example: Execution Time Logger

```java
@Aspect
@Component
public class PerformanceAspect {

    private static final Logger log = LoggerFactory.getLogger(PerformanceAspect.class);
    private static final long SLOW_THRESHOLD_MS = 500;

    @Around("execution(* com.example.service..*(..))")
    public Object trackPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long start = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;

            if (duration > SLOW_THRESHOLD_MS) {
                log.warn("SLOW METHOD: {} took {}ms", methodName, duration);
            } else {
                log.debug("{} took {}ms", methodName, duration);
            }

            return result;
        } catch (Throwable t) {
            long duration = System.currentTimeMillis() - start;
            log.error("{} failed after {}ms: {}", methodName, duration, t.getMessage());
            throw t;
        }
    }
}
```

## Common Mistake

Using `@Around` without calling `joinPoint.proceed()` — the actual method never executes:

```java
@Aspect
@Component
public class SecurityAspect {

    // BROKEN — proceed() never called — all service methods silently return null
    @Around("execution(* com.example.service.*.*(..))")
    public Object checkSecurity(ProceedingJoinPoint joinPoint) {
        if (!SecurityContext.isAuthenticated()) {
            throw new AccessDeniedException("Not authenticated");
        }
        // BUG: forgot to call joinPoint.proceed() — method body never runs!
        // Returns null for every intercepted method
    }

    // RIGHT
    @Around("execution(* com.example.service.*.*(..))")
    public Object checkSecurity(ProceedingJoinPoint joinPoint) throws Throwable {
        if (!SecurityContext.isAuthenticated()) {
            throw new AccessDeniedException("Not authenticated");
        }
        return joinPoint.proceed();  // Execute the real method and return its result
    }
}
```

## When to Reach For This

- Logging method entry/exit without polluting every class with logger calls
- Measuring execution time across all service methods
- Auditing — recording who called what and when, without changing business logic
- Retry logic — intercept methods annotated `@Retryable` and re-invoke on transient failure
- Security checks that apply to a category of methods by naming convention or annotation
