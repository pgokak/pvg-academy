// SENDING EMAIL WITH SPRING MAIL — Starter Exercise
//
// SCENARIO: An EmailService that currently uses raw JavaMail boilerplate.
// Replace it with Spring Mail's clean API.
//
// YOUR TASKS:
// 1. Add spring-boot-starter-mail to pom.xml (shown as a comment)
// 2. Add SMTP configuration to application.yml using environment variables (shown as comment)
// 3. Implement sendSimpleEmail() using SimpleMailMessage
// 4. Implement sendHtmlEmail() using MimeMessage + MimeMessageHelper
// 5. Implement sendEmailWithAttachment() — add a file as an attachment
// 6. Add @Async to all three send methods so they don't block the HTTP thread

package com.example.app.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;

// TODO 1: Add to pom.xml:
// <dependency>
//   <groupId>org.springframework.boot</groupId>
//   <artifactId>spring-boot-starter-mail</artifactId>
// </dependency>

// TODO 2: Add to application.yml:
// spring:
//   mail:
//     host: smtp.gmail.com
//     port: 587
//     username: ${MAIL_USERNAME}
//     password: ${MAIL_PASSWORD}
//     properties:
//       mail.smtp.starttls.enable: true
//       mail.smtp.auth: true

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // TODO 3: Implement using SimpleMailMessage
    // - Create a SimpleMailMessage
    // - Set to, from ("noreply@myapp.com"), subject, text
    // - Call mailSender.send(message)
    // TODO 6: Add @Async so this doesn't block the caller
    public void sendSimpleEmail(String to, String subject, String text) {
        // Replace this placeholder with SimpleMailMessage implementation
        throw new UnsupportedOperationException("TODO: implement sendSimpleEmail");
    }

    // TODO 4: Implement using MimeMessage + MimeMessageHelper
    // - Create message via mailSender.createMimeMessage()
    // - Create MimeMessageHelper(message, true, "UTF-8")
    // - Set to, from, subject
    // - Call helper.setText(htmlContent, true)  ← true means HTML
    // - Call mailSender.send(message)
    // TODO 6: Add @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent)
        throws MessagingException {
        throw new UnsupportedOperationException("TODO: implement sendHtmlEmail");
    }

    // TODO 5: Implement using MimeMessageHelper with attachment
    // - Same setup as sendHtmlEmail
    // - Add: helper.addAttachment(attachment.getName(), attachment)
    // TODO 6: Add @Async
    public void sendEmailWithAttachment(String to, String subject, String body, File attachment)
        throws MessagingException {
        throw new UnsupportedOperationException("TODO: implement sendEmailWithAttachment");
    }
}
