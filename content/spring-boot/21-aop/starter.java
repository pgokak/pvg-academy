// AOP & CROSS-CUTTING CONCERNS — Starter Exercise
//
// SCENARIO: Build a LoggingAspect that adds logging and timing
// to all service methods without touching the service classes.
//
// YOUR TASKS:
// 1. Add @Aspect and @Component to LoggingAspect
// 2. Add a @Before advice that logs the method name and arguments
// 3. Add an @Around advice that measures and logs execution time in milliseconds
// 4. Add an @AfterThrowing advice that logs exceptions thrown by service methods
// 5. Define a reusable @Pointcut named serviceLayer() for "execution(* com.example.service.*.*(..))"
//    and use it in all three advices (instead of repeating the expression)
// 6. Add a custom @Loggable annotation and an @Around advice that activates
//    only on methods annotated with @Loggable

package com.example.app.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.lang.annotation.*;
import java.util.Arrays;

// TODO 1: Add @Aspect and @Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    // TODO 5: Define a reusable pointcut for all service layer methods
    // Pointcut expression: execution(* com.example.service.*.*(..))
    // Method name: serviceLayer()
    // Then replace the execution strings in advices below with serviceLayer()

    // TODO 2: @Before advice — log method name + arguments
    // Use joinPoint.getSignature().getName() for method name
    // Use Arrays.toString(joinPoint.getArgs()) for arguments
    public void logMethodEntry(JoinPoint joinPoint) {
        // TODO: implement
    }

    // TODO 3: @Around advice — measure execution time
    // IMPORTANT: You MUST call joinPoint.proceed() and return its result
    // Log: "<methodName> took <duration>ms"
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        // TODO: record start time
        // TODO: call joinPoint.proceed() — store in a variable
        // TODO: record end time, log duration
        // TODO: return the result
        return null; // replace with actual implementation
    }

    // TODO 4: @AfterThrowing advice — log exceptions
    // Use throwing = "exception" to capture the thrown exception
    // Log: "<methodName> threw: <exception message>"
    public void logException(JoinPoint joinPoint, Exception exception) {
        // TODO: implement
    }
}

// TODO 6a: Define a @Loggable annotation
// - @Target(ElementType.METHOD)
// - @Retention(RetentionPolicy.RUNTIME)
// - Optional String value() attribute with default ""
// (define in its own file in production; here for convenience)

// TODO 6b: Add an @Around advice in LoggingAspect that:
// - Uses pointcut: @annotation(loggable)
// - Logs "Starting: <methodName> (<loggable.value()>)"
// - Calls proceed()
// - Logs "Completed: <methodName>"
