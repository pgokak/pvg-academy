// AOP & CROSS-CUTTING CONCERNS — Solution

package com.example.app.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.lang.annotation.*;
import java.util.Arrays;

// ─── Custom annotation for selective AOP (Task 6a) ───────────────────────────
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@interface Loggable {
    String value() default "";
}

// ─── Main aspect (Tasks 1-6) ──────────────────────────────────────────────────
// Task 1: @Aspect marks this as an AOP aspect; @Component registers it as a Spring bean
@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    // Task 5: Reusable named pointcut — avoids duplicating the expression everywhere
    // All public methods in any class inside com.example.service package
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceLayer() {}

    // Task 2: @Before — runs before the intercepted method
    // Uses the named pointcut defined above
    @Before("serviceLayer()")
    public void logMethodEntry(JoinPoint joinPoint) {
        log.info("Entering: {}.{}() args={}",
            joinPoint.getTarget().getClass().getSimpleName(),
            joinPoint.getSignature().getName(),
            Arrays.toString(joinPoint.getArgs()));
    }

    // Task 3: @Around — wraps the method completely
    // MUST call joinPoint.proceed() or the real method never runs
    @Around("serviceLayer()")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        Object result = joinPoint.proceed();  // Execute the actual method

        long duration = System.currentTimeMillis() - start;
        log.info("{} took {}ms", joinPoint.getSignature().getName(), duration);

        return result;  // Must return — callers expect the method's return value
    }

    // Task 4: @AfterThrowing — runs only when the method throws an exception
    // Does not suppress the exception — it still propagates after this advice runs
    @AfterThrowing(pointcut = "serviceLayer()", throwing = "exception")
    public void logException(JoinPoint joinPoint, Exception exception) {
        log.error("{} threw {}: {}",
            joinPoint.getSignature().getName(),
            exception.getClass().getSimpleName(),
            exception.getMessage());
    }

    // Task 6b: @Around for @Loggable-annotated methods only
    // "loggable" in the signature binds the annotation instance so we can read its value()
    @Around("@annotation(loggable)")
    public Object logAnnotatedMethod(ProceedingJoinPoint joinPoint, Loggable loggable)
        throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String description = loggable.value().isEmpty() ? methodName : loggable.value();

        log.info("Starting: {} ({})", methodName, description);
        long start = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            log.info("Completed: {} in {}ms", methodName, System.currentTimeMillis() - start);
            return result;
        } catch (Throwable t) {
            log.error("Failed: {} after {}ms — {}", methodName,
                System.currentTimeMillis() - start, t.getMessage());
            throw t;
        }
    }
}

// ─── Example: service that benefits from the aspect ──────────────────────────
// No logging code here — LoggingAspect handles it transparently
package com.example.service;

import com.example.app.aspect.Loggable;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    // This method is logged + timed by LoggingAspect automatically
    // AND gets @Loggable extra logging because of the annotation
    @Loggable("place order for customer")
    public String placeOrder(String customerId, String productId) {
        // Business logic only — no logging, no timing boilerplate
        return "order-" + System.currentTimeMillis();
    }

    // This method is logged + timed by the serviceLayer() pointcut
    public void cancelOrder(String orderId) {
        // Business logic only
    }
}
