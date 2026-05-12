// CONFIGURATION & PROPERTIES — Starter Exercise
//
// TASK: Extract hardcoded values to application.properties and @ConfigurationProperties.
//
// YOUR TASKS:
// 1. Create an AppProperties record/class for prefix "app" with nested:
//    - email: smtpHost, smtpPort (int), from, maxRetries (int)
//    - payment: stripeKey, maxRetries (int), webhookSecret
// 2. Annotate AppProperties with @ConfigurationProperties(prefix = "app")
// 3. Add @Validated + constraints: smtpHost not blank, smtpPort 1-65535, from @Email
// 4. Refactor EmailService to inject AppProperties instead of hardcoded values
// 5. Write the application.properties entries (in comments)
//    — use ${ENV_VAR} syntax for secrets

package com.example.issuetracker.config;

// ─── BEFORE: Hardcoded values (fix this) ─────────────────────────────────────
class EmailServiceBefore {
    private static final String SMTP_HOST = "smtp.gmail.com";   // Hardcoded
    private static final int SMTP_PORT = 587;                    // Hardcoded
    private static final String FROM = "noreply@company.com";   // Hardcoded
    private static final int MAX_RETRIES = 3;                   // Hardcoded

    void send(String to, String subject) {
        System.out.println("Connecting to " + SMTP_HOST + ":" + SMTP_PORT);
        System.out.println("Sending from " + FROM);
    }
}

// ─── Task 1 & 2: Create @ConfigurationProperties ─────────────────────────────
// TODO: Create AppProperties with nested EmailProperties and PaymentProperties
// @ConfigurationProperties(prefix = "app")
// public class AppProperties {
//     private EmailProperties email = new EmailProperties();
//     private PaymentProperties payment = new PaymentProperties();
//     // getters/setters
// }

// ─── Task 3: Add validation ───────────────────────────────────────────────────
// TODO: Add @Validated to AppProperties
// TODO: Add @NotBlank on smtpHost, @Email on from, @Min(1) @Max(65535) on smtpPort

// ─── Task 4: Refactored EmailService ─────────────────────────────────────────
// TODO: Create EmailServiceAfter that injects AppProperties via constructor
// and uses config.getEmail().getSmtpHost() etc.

// ─── Task 5: application.properties (write these as comments) ────────────────
// TODO: Write the properties entries for:
//   - app.email.smtp-host
//   - app.email.smtp-port
//   - app.email.from
//   - app.email.max-retries
//   - app.payment.stripe-key (use ${STRIPE_KEY} env var)
//   - app.payment.max-retries
//   - app.payment.webhook-secret (use ${STRIPE_WEBHOOK_SECRET} env var)
