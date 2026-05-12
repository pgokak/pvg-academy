---
title: "Async Processing & Scheduling"
version: "Spring Boot 3.x"
since: 2010
stable: true
---

## The Problem

```java
@Service
public class UserService {

    public UserDto register(RegisterRequest request) {
        User user = createUser(request);
        userRepository.save(user);

        emailService.sendWelcomeEmail(user.getEmail());  // 2 seconds — SMTP round trip
        // The HTTP response is blocked for 2 full seconds
        // The user sees a spinning loader waiting for an email they don't need to wait for

        return UserDto.from(user);
    }
}
```

The user registration takes 2 seconds not because saving the user is slow, but because we're waiting for an email to be delivered. Everything after saving the user could happen in the background.

## Mental Model

Async is handing a task to a colleague and walking away — you don't wait for them to finish. Scheduling is setting a recurring alarm — the task runs whether you're watching or not. Both free the main thread to do more useful work instead of standing around.

## @EnableAsync — Turn It On

```java
@SpringBootApplication
@EnableAsync  // Activates Spring's async proxy infrastructure
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## @Async — Fire and Forget

```java
@Service
public class EmailService {

    // @Async: the caller gets control back immediately
    // This method runs in a separate thread from Spring's task executor pool
    @Async
    public void sendWelcomeEmail(String email) {
        // Runs in a background thread — caller doesn't wait
        System.out.println("Sending email on thread: " + Thread.currentThread().getName());
        smtpClient.send(email, "Welcome!", "Thanks for signing up.");
    }
}

@Service
public class UserService {

    public UserDto register(RegisterRequest request) {
        User user = createUser(request);
        userRepository.save(user);

        emailService.sendWelcomeEmail(user.getEmail());  // Returns immediately
        // Response sent to user NOW — email delivers in background

        return UserDto.from(user);
    }
}
```

## @Async with CompletableFuture — When You Need the Result

```java
@Service
public class ReportService {

    // Returns CompletableFuture so the caller can wait when needed, or chain further work
    @Async
    public CompletableFuture<ReportData> generateSalesReport(LocalDate from, LocalDate to) {
        ReportData data = heavyReportQuery(from, to);  // 5 seconds
        return CompletableFuture.completedFuture(data);
    }
}

@RestController
public class ReportController {

    @GetMapping("/reports/sales")
    public CompletableFuture<ReportData> getSalesReport(
        @RequestParam LocalDate from, @RequestParam LocalDate to) {
        // Spring MVC handles CompletableFuture — response written when the future completes
        return reportService.generateSalesReport(from, to);
    }
}
```

## @EnableScheduling — Turn On Scheduling

```java
@SpringBootApplication
@EnableAsync
@EnableScheduling  // Activates @Scheduled task runner
public class Application { ... }
```

## @Scheduled — Run Tasks on a Timer

```java
@Component
public class MaintenanceTasks {

    // Fixed rate: runs every 5 seconds from application start
    // Next execution starts 5 seconds after the previous one STARTED
    @Scheduled(fixedRate = 5000)
    public void heartbeat() {
        log.info("Heartbeat at {}", Instant.now());
    }

    // Fixed delay: waits 5 seconds after the previous execution COMPLETED
    // If the task takes 3 seconds, next run starts 5 seconds later (total: 8s gap)
    @Scheduled(fixedDelay = 5000)
    public void processQueue() {
        messageQueue.drainAndProcess();
    }

    // Cron expression: "second minute hour day-of-month month day-of-week"
    @Scheduled(cron = "0 0 * * * *")     // Top of every hour
    public void generateHourlyMetrics() { ... }

    @Scheduled(cron = "0 0 2 * * *")     // 2 AM every day
    public void cleanupExpiredSessions() { ... }

    @Scheduled(cron = "0 0 9 * * MON-FRI")  // 9 AM weekdays
    public void sendDailySummaryEmail() { ... }
}
```

| Expression          | Meaning            |
| ------------------- | ------------------ |
| `0 * * * * *`       | Every minute       |
| `0 0 * * * *`       | Every hour         |
| `0 0 0 * * *`       | Midnight every day |
| `0 0 9 * * MON-FRI` | 9 AM weekdays      |
| `0 */15 * * * *`    | Every 15 minutes   |

## Thread Pool Configuration

```yaml
# application.yml
spring:
  task:
    execution:
      pool:
        core-size: 5 # Minimum threads always alive
        max-size: 20 # Maximum threads under load
        queue-capacity: 100 # Requests queued when all threads busy
      thread-name-prefix: async-task-
    scheduling:
      pool:
        size: 3 # Threads for @Scheduled tasks
```

## Async Exception Handling

Fire-and-forget `@Async void` methods swallow exceptions silently by default. Configure a handler:

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, params) -> {
            log.error("Async method {} failed with: {}", method.getName(), throwable.getMessage());
            // Alert, retry, or dead-letter queue
        };
    }
}
```

## Common Mistake

Calling an `@Async` method from within the same class — the Spring proxy is bypassed, the method runs synchronously:

```java
@Service
public class NotificationService {

    public void notifyUser(User user) {
        sendEmail(user.getEmail());  // BUG: same-class call — runs synchronously
        // @Async on sendEmail is IGNORED — the caller blocks for 2 seconds
    }

    @Async
    public void sendEmail(String email) {
        smtpClient.send(email, "Notification", "...");
    }
}

// FIX: extract sendEmail into a separate @Service bean
@Service
public class EmailService {
    @Async
    public void sendEmail(String email) { ... }
}

@Service
public class NotificationService {
    private final EmailService emailService;  // Injected — calls go through proxy

    public void notifyUser(User user) {
        emailService.sendEmail(user.getEmail());  // Now truly async
    }
}
```

## When to Reach For This

- Sending emails, push notifications, or webhooks after an HTTP response
- Running DB cleanup, report generation, or batch jobs on a schedule
- Parallel data fetching where multiple `CompletableFuture`s can be joined
- Background retries or queue draining that shouldn't block user requests
- Any side effect that's best-effort and doesn't need to delay the response
