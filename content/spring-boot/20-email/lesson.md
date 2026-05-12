---
title: "Sending Email with Spring Mail"
version: "Spring Boot 3.x"
since: 2008
stable: true
---

## The Problem

```java
// Raw JavaMail — 40 lines of boilerplate for one email
public void sendEmail(String to, String subject, String body) throws Exception {
    Properties props = new Properties();
    props.put("mail.smtp.host", "smtp.gmail.com");
    props.put("mail.smtp.port", "587");
    props.put("mail.smtp.auth", "true");
    props.put("mail.smtp.starttls.enable", "true");

    Session session = Session.getInstance(props, new Authenticator() {
        protected PasswordAuthentication getPasswordAuthentication() {
            return new PasswordAuthentication("user@example.com", "password123"); // hardcoded!
        }
    });

    Message message = new MimeMessage(session);
    message.setFrom(new InternetAddress("user@example.com"));
    message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
    message.setSubject(subject);
    message.setText(body);
    Transport.send(message);
    // Exception handling, retry logic, connection management — all yours to write
}
```

Every method duplicates the same boilerplate. SMTP credentials hardcoded in Java code.

## Mental Model

Spring Mail is a postman service. You hand it an envelope (`MimeMessage`) with the address and content filled in — it handles the SMTP protocol, connection pooling, and transport details. You describe what to send; Spring Mail figures out how to deliver it.

## Dependency

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

## Configuration

```yaml
# application.yml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME} # Read from environment variable — never hardcode
    password: ${MAIL_PASSWORD} # App password for Gmail (not your login password)
    properties:
      mail:
        smtp:
          starttls:
            enable: true # TLS encryption
          auth: true
          connectiontimeout: 5000
          timeout: 5000
```

## Simple Text Email

```java
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom("noreply@myapp.com");
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}
```

## HTML Email with MimeMessageHelper

```java
public void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");  // true = multipart

    helper.setTo(to);
    helper.setFrom("noreply@myapp.com");
    helper.setSubject(subject);
    helper.setText(htmlContent, true);  // true = content is HTML

    mailSender.send(message);
}

// Inline image (appears in email body, not as attachment)
public void sendEmailWithInlineImage(String to, File imageFile) throws MessagingException {
    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true);

    helper.setTo(to);
    helper.setSubject("Your receipt");
    helper.setText("<h1>Thank you!</h1><img src='cid:logo'/>", true);
    helper.addInline("logo", imageFile);   // cid: reference matches addInline id

    mailSender.send(message);
}

// Attachment (opens as downloaded file)
public void sendEmailWithAttachment(String to, String subject, File attachment)
    throws MessagingException {
    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true);

    helper.setTo(to);
    helper.setSubject(subject);
    helper.setText("Please find your invoice attached.");
    helper.addAttachment(attachment.getName(), attachment);  // filename shown in email client

    mailSender.send(message);
}
```

## Thymeleaf Email Templates

```java
@Service
public class TemplatedEmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public void sendWelcomeEmail(String to, String username) throws MessagingException {
        // Build Thymeleaf context — variables available in the template
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("loginUrl", "https://myapp.com/login");
        context.setVariable("year", LocalDate.now().getYear());

        // Process the template — returns HTML string
        String htmlBody = templateEngine.process("emails/welcome", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject("Welcome to MyApp!");
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }
}
```

```html
<!-- src/main/resources/templates/emails/welcome.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
  <body>
    <h1>Welcome, <span th:text="${username}">User</span>!</h1>
    <p><a th:href="${loginUrl}">Click here to log in</a></p>
    <footer>&copy; <span th:text="${year}">2025</span> MyApp</footer>
  </body>
</html>
```

## Async Sending

Email sending blocks the calling thread for network round-trip time. Always send async:

```java
@Async
public void sendWelcomeEmailAsync(String to, String username) throws MessagingException {
    sendWelcomeEmail(to, username);  // The blocking call is now in a background thread
}
```

## Testing

```java
// Unit test — mock JavaMailSender, verify it was called correctly
@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    JavaMailSender mailSender;

    @InjectMocks
    EmailService emailService;

    @Test
    void sendSimpleEmail_callsMailSender() {
        SimpleMailMessage[] captured = new SimpleMailMessage[1];
        doAnswer(inv -> { captured[0] = inv.getArgument(0); return null; })
            .when(mailSender).send(any(SimpleMailMessage.class));

        emailService.sendSimpleEmail("user@test.com", "Hello", "Body");

        assertThat(captured[0].getTo()).contains("user@test.com");
        assertThat(captured[0].getSubject()).isEqualTo("Hello");
    }
}

// Integration test — use GreenMail (in-memory SMTP server)
@SpringBootTest
class EmailIntegrationTest {

    @RegisterExtension
    static GreenMailExtension greenMail = new GreenMailExtension(ServerSetupTest.SMTP)
        .withConfiguration(GreenMailConfiguration.aConfig().withUser("user", "password"));
}
```

## Common Mistake

Hardcoding SMTP credentials in Java code or `application.yml`:

```yaml
# WRONG — credentials committed to source control
spring:
  mail:
    username: alice@gmail.com
    password: hunter2

# RIGHT — use environment variables
spring:
  mail:
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
```

Set the actual values in your deployment environment (Docker env, Kubernetes secret, Heroku config var) — never in the codebase.

## When to Reach For This

- Welcome emails, password reset, email verification flows
- Order confirmations, invoices, receipts — use HTML templates
- Scheduled digest emails (combine with `@Scheduled`)
- Any notification that needs rich formatting or attachments
- Transactional emails where delivery must be confirmed (use `@Async` + `CompletableFuture`)
