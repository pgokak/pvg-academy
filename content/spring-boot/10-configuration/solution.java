// CONFIGURATION & PROPERTIES — Solution

package com.example.issuetracker.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

// ─── Tasks 1, 2, 3: Type-safe config with validation ────────────────────────
@ConfigurationProperties(prefix = "app")
@Validated  // Validates constraint annotations at startup — fails fast if config is wrong
public class AppProperties {

    @Valid  // Cascade validation to nested objects
    private EmailProperties email = new EmailProperties();

    @Valid
    private PaymentProperties payment = new PaymentProperties();

    public EmailProperties getEmail() { return email; }
    public PaymentProperties getPayment() { return payment; }
    public void setEmail(EmailProperties email) { this.email = email; }
    public void setPayment(PaymentProperties payment) { this.payment = payment; }

    public static class EmailProperties {
        @NotBlank(message = "SMTP host must be configured")
        private String smtpHost;

        @Min(value = 1, message = "Port must be >= 1")
        @Max(value = 65535, message = "Port must be <= 65535")
        private int smtpPort = 587;

        @NotBlank
        @Email(message = "From address must be a valid email")
        private String from;

        @Min(1) @Max(10)
        private int maxRetries = 3;

        public String getSmtpHost() { return smtpHost; }
        public int getSmtpPort() { return smtpPort; }
        public String getFrom() { return from; }
        public int getMaxRetries() { return maxRetries; }
        public void setSmtpHost(String h) { this.smtpHost = h; }
        public void setSmtpPort(int p) { this.smtpPort = p; }
        public void setFrom(String f) { this.from = f; }
        public void setMaxRetries(int r) { this.maxRetries = r; }
    }

    public static class PaymentProperties {
        @NotBlank(message = "Stripe key must be configured via STRIPE_KEY env var")
        private String stripeKey;

        private int maxRetries = 3;

        @NotBlank(message = "Webhook secret must be configured via STRIPE_WEBHOOK_SECRET env var")
        private String webhookSecret;

        public String getStripeKey() { return stripeKey; }
        public int getMaxRetries() { return maxRetries; }
        public String getWebhookSecret() { return webhookSecret; }
        public void setStripeKey(String k) { this.stripeKey = k; }
        public void setMaxRetries(int r) { this.maxRetries = r; }
        public void setWebhookSecret(String s) { this.webhookSecret = s; }
    }
}

// Register the @ConfigurationProperties bean
@Configuration
@EnableConfigurationProperties(AppProperties.class)
class AppConfig {}

// ─── Task 4: Refactored service ───────────────────────────────────────────────
// @Service
class EmailService {
    private final AppProperties appProperties;

    // Inject the whole config object — no @Value, no hardcoded values
    EmailService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    void send(String to, String subject) {
        AppProperties.EmailProperties email = appProperties.getEmail();
        System.out.printf("Connecting to %s:%d%n", email.getSmtpHost(), email.getSmtpPort());
        System.out.printf("Sending '%s' from %s to %s%n", subject, email.getFrom(), to);
    }
}

// ─── Task 5: application.properties ─────────────────────────────────────────
/*
# src/main/resources/application.properties

# Email
app.email.smtp-host=smtp.gmail.com
app.email.smtp-port=587
app.email.from=noreply@company.com
app.email.max-retries=3

# Payment — secrets come from environment variables
# In production: set STRIPE_KEY and STRIPE_WEBHOOK_SECRET in your deployment environment
app.payment.stripe-key=${STRIPE_KEY}
app.payment.max-retries=3
app.payment.webhook-secret=${STRIPE_WEBHOOK_SECRET}

# For local development, create a .env file or set them in your run configuration:
# STRIPE_KEY=sk_test_localTestKey
# STRIPE_WEBHOOK_SECRET=whsec_localTestSecret
# (NEVER commit the actual production values to git)
*/
