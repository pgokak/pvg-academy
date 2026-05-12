---
title: "Exception Handling"
version: "Spring Boot 3.x"
since: 2014
stable: true
---

## The Problem

```java
// Try/catch in every controller — inconsistent error shapes
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    try {
        return userService.findById(id);
    } catch (Exception e) {
        // Returns 200 OK with "error" text — wrong status, wrong format
        return null;
    }
}

@DeleteMapping("/users/{id}")
public void deleteUser(@PathVariable Long id) {
    try {
        userService.delete(id);
    } catch (Exception e) {
        throw new RuntimeException("Something went wrong"); // 500, generic message
    }
}
// Every endpoint has different error handling, different error shapes, different status codes
```

Clients don't know what to expect. Some errors return 200 with null. Some return 500 with a stack trace. None return the same structured error format.

## Mental Model

A `@ControllerAdvice` is a central emergency room. Instead of handling exceptions at each controller, all exceptions route to one place for consistent treatment. Every exception gets diagnosed and treated the same way.

## Custom Exceptions

```java
// Domain exceptions communicate what went wrong in business terms
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

public class ConflictException extends RuntimeException {
    public ConflictException(String message) { super(message); }
}

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) { super(message); }
}
```

## @ControllerAdvice — Global Exception Handler

```java
@ControllerAdvice  // Applies to all controllers in the application
public class GlobalExceptionHandler {

    // Handles ResourceNotFoundException → 404
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Resource Not Found");
        problem.setInstance(URI.create(request.getRequestURI()));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    // Handles ConflictException → 409
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ProblemDetail> handleConflict(ConflictException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Conflict");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    // Handles Bean Validation failures → 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(
            MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Validation Failed");

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        problem.setProperty("errors", errors);

        return ResponseEntity.badRequest().body(problem);
    }

    // Catch-all — unexpected exceptions → 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        return ResponseEntity.status(500).body(problem);
    }
}
```

## ProblemDetail — RFC 9457 (Spring Boot 3+)

Spring Boot 3 introduced `ProblemDetail` as the standard error response format:

```json
{
  "type": "https://example.com/problems/user-not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "User not found: 42",
  "instance": "/api/users/42"
}
```

This follows the RFC 9457 (formerly RFC 7807) Problem Details standard — any client that speaks RFC 7807/9457 can parse your errors.

## Common Mistake

Throwing exceptions with no `@ExceptionHandler` to catch them — Spring returns a generic 500 with a stack trace:

```java
// WRONG — throwing RuntimeException directly from service
public User findById(Long id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Not found"));
    // Spring returns 500 Internal Server Error
    // Client receives a stack trace dump
}

// RIGHT — throw domain exception, handle in @ControllerAdvice
public User findById(Long id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    // @ControllerAdvice catches ResourceNotFoundException → returns clean 404
}
```

## When to Reach For This

- Every application with a REST API — implement `@ControllerAdvice` before writing endpoints
- When clients need predictable error shapes — `ProblemDetail` gives them a standard format
- When mapping domain errors to HTTP status codes — `ResourceNotFoundException` → 404, `ConflictException` → 409
- When you have validation failures — catch `MethodArgumentNotValidException` and return field-level errors
- When debugging — the catch-all `Exception` handler logs the stack trace server-side while sending a safe message to the client
