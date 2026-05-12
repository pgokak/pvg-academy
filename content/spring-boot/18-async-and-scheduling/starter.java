// ASYNC PROCESSING & SCHEDULING — Starter Exercise
//
// SCENARIO: An EmailService that blocks the caller, and a ReportService
// that needs to run on a schedule automatically.
//
// YOUR TASKS:
// 1. Add @EnableAsync and @EnableScheduling to AppConfig (see below)
// 2. Add @Async to sendWelcomeEmail() so it runs in a background thread
// 3. Change sendEmailWithResult() return type to CompletableFuture<String>
//    and add @Async — used when the caller needs to know the outcome
// 4. Add @Scheduled(cron = "0 0 2 * * *") to generateDailyReport()
//    — should run at 2 AM every day
// 5. Add @Scheduled(fixedDelay = 30000) to processOutboxMessages()
//    — should run 30 seconds after the previous run completes
// 6. Configure an AsyncUncaughtExceptionHandler in AppConfig to log failures

package com.example.app.service;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.concurrent.CompletableFuture;

// TODO 1: Add @EnableAsync and @EnableScheduling here
// TODO 6: Implement AsyncConfigurer to add an AsyncUncaughtExceptionHandler
@Configuration
public class AppConfig {
    // Add @EnableAsync, @EnableScheduling
    // Implement getAsyncUncaughtExceptionHandler() to log method name + exception message
}

// ─── EmailService ─────────────────────────────────────────────────────────────
@Service
public class EmailService {

    // TODO 2: Add @Async so this method runs in a background thread.
    // The caller (UserService) should get control back immediately.
    // Return type is void — fire and forget.
    public void sendWelcomeEmail(String toEmail, String username) {
        System.out.println("Sending welcome email to " + toEmail + " on thread: "
            + Thread.currentThread().getName());
        // Simulate SMTP delay
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println("Welcome email sent to " + toEmail);
    }

    // TODO 3: Add @Async and change the return type to CompletableFuture<String>
    // Wrap the return value: CompletableFuture.completedFuture("sent")
    // The caller can use .get() or .thenAccept() to handle the result when ready.
    public String sendEmailWithResult(String toEmail, String subject, String body) {
        System.out.println("Sending email with subject: " + subject);
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "sent";
    }
}

// ─── ReportService ────────────────────────────────────────────────────────────
@Component
public class ReportService {

    // TODO 4: Add @Scheduled(cron = "0 0 2 * * *") to run at 2 AM daily
    // Cron format: second minute hour day-of-month month day-of-week
    public void generateDailyReport() {
        LocalDate today = LocalDate.now();
        System.out.println("Generating daily report for: " + today);
        // Query DB, aggregate data, write to S3 or email...
    }

    // TODO 5: Add @Scheduled(fixedDelay = 30000) to run 30s after last completion
    // fixedDelay waits for the method to finish before starting the countdown
    // (compare to fixedRate which starts the countdown when the method starts)
    public void processOutboxMessages() {
        System.out.println("Processing outbox messages on thread: "
            + Thread.currentThread().getName());
        // Read unprocessed messages from outbox table, send them, mark as done
    }
}
