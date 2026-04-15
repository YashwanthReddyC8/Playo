package com.sportify.sports.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.email.from:noreply@playo.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Send password reset email with HTML template
     */
    public void sendPasswordResetEmail(String toEmail, String userName, String resetToken) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            // Prepare template context
            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("resetLink", resetLink);
            context.setVariable("expiryHours", 1);

            sendTemplateEmail(
                    toEmail,
                    "Password Reset Request - Playo",
                    "password-reset-email",
                    context);
            log.info("Password reset email sent to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    /**
     * Send account verification email (for future use)
     */
    public void sendVerificationEmail(String toEmail, String userName, String verificationLink) {
        try {
            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("verificationLink", verificationLink);

            sendTemplateEmail(
                    toEmail,
                    "Verify Your Email - Playo",
                    "verification-email",
                    context);
            log.info("Verification email sent to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send verification email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    private void sendTemplateEmail(String toEmail, String subject, String templateName, Context context)
            throws MessagingException {
        String htmlContent = templateEngine.process(templateName, context);

        var mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
    }
}
