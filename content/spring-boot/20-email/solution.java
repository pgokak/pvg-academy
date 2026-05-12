// SENDING EMAIL WITH SPRING MAIL — Solution

package com.example.app.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class EmailService {

    private static final String FROM_ADDRESS = "noreply@myapp.com";

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Task 3 + 6: Simple text email — async so caller doesn't wait for SMTP round-trip
    @Async
    public void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(FROM_ADDRESS);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    // Task 4 + 6: HTML email using MimeMessageHelper
    // MimeMessage supports HTML, attachments, inline images — SimpleMailMessage does not
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent)
        throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();

        // true = multipart mode (required for HTML and attachments)
        // "UTF-8" = charset for subject and body encoding
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setFrom(FROM_ADDRESS);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);  // second arg true = interpret as HTML

        mailSender.send(message);
    }

    // Task 5 + 6: HTML email with attachment
    @Async
    public void sendEmailWithAttachment(String to, String subject, String body, File attachment)
        throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setFrom(FROM_ADDRESS);
        helper.setSubject(subject);
        helper.setText(body, false);  // plain text body (false = not HTML)

        // Attach the file — filename is shown in the email client's attachment list
        helper.addAttachment(attachment.getName(), attachment);

        mailSender.send(message);
    }
}

// ─── application.yml (Task 2) ─────────────────────────────────────────────────
//
// spring:
//   mail:
//     host: smtp.gmail.com
//     port: 587
//     username: ${MAIL_USERNAME}      # Set as environment variable — never hardcode
//     password: ${MAIL_PASSWORD}      # Gmail: use App Password, not account password
//     properties:
//       mail:
//         smtp:
//           starttls:
//             enable: true
//           auth: true
//           connectiontimeout: 5000
//           timeout: 5000
