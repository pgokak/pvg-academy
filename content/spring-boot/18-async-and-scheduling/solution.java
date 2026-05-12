// ASYNC PROCESSING & SCHEDULING — Solution

package com.example.app.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.concurrent.CompletableFuture;

// ─── Task 1 + Task 6: Enable async/scheduling + exception handler ─────────────
@Configuration
@EnableAsync        // Activates @Async proxy infrastructure
@EnableScheduling   // Activates @Scheduled task runner
public class AppConfig implements AsyncConfigurer {

    private static final Logger log = LoggerFactory.getLogger(AppConfig.class);

    // Task 6: Called when a void @Async method throws an uncaught exception
    // Without this, exceptions are swallowed silently — very hard to debug
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, params) -> {
            log.error("Async method '{}' in '{}' threw: {}",
                method.getName(),
                method.getDeclaringClass().getSimpleName(),
                throwable.getMessage(),
                throwable);
        };
    }
}

// ─── EmailService ─────────────────────────────────────────────────────────────
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    // Task 2: @Async — runs in Spring's task executor thread pool
    // Caller returns immediately; email sends in background
    // Return type is void — fire and forget, no way to get the result
    @Async
    public void sendWelcomeEmail(String toEmail, String username) {
        log.info("Sending welcome email to {} on thread: {}", toEmail,
            Thread.currentThread().getName());
        try {
            Thread.sleep(2000);  // Simulate SMTP delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Email send interrupted", e);
        }
        log.info("Welcome email sent to {}", toEmail);
    }

    // Task 3: @Async with CompletableFuture — caller can chain work or wait for result
    // Must wrap the return in CompletableFuture.completedFuture()
    @Async
    public CompletableFuture<String> sendEmailWithResult(String toEmail, String subject, String body) {
        log.info("Sending '{}' to {} on thread: {}", subject, toEmail,
            Thread.currentThread().getName());
        try {
            Thread.sleep(1500);  // Simulate SMTP delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return CompletableFuture.failedFuture(e);
        }
        return CompletableFuture.completedFuture("sent");
    }
}

// ─── ReportService ────────────────────────────────────────────────────────────
@Component
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);

    // Task 4: Cron expression — 0 0 2 * * *
    // second=0, minute=0, hour=2, every day-of-month, every month, every day-of-week
    // Result: runs at exactly 02:00:00 every day
    @Scheduled(cron = "0 0 2 * * *")
    public void generateDailyReport() {
        LocalDate today = LocalDate.now();
        log.info("Generating daily report for: {}", today);
        // Query DB, aggregate, write to storage
    }

    // Task 5: fixedDelay — waits 30 seconds AFTER the method completes before re-running
    // Use when the task duration is variable and you don't want overlap
    // (fixedRate would start every 30s regardless of how long the task takes)
    @Scheduled(fixedDelay = 30000)
    public void processOutboxMessages() {
        log.info("Processing outbox messages on thread: {}",
            Thread.currentThread().getName());
        // Read unprocessed rows from outbox table, send, mark as sent
    }
}
