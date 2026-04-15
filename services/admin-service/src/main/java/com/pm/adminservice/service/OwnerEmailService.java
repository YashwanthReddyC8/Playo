package com.pm.adminservice.service;

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
public class OwnerEmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.email.from:noreply@playo.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Send password reset email for new owner accounts
     */
    public void sendPasswordResetEmail(String toEmail, String ownerName) {
        try {
            Context context = new Context();
            context.setVariable("ownerName", ownerName);
            context.setVariable("resetUrl", frontendUrl + "/forgot-password");

            sendTemplateEmail(
                    toEmail,
                    "Your Playo Owner Account Created - Set Your Password",
                    "owner-password-reset-email",
                    context);
            log.info("Password reset email sent to new owner: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    /**
     * Send center application approval notification
     */
    public void sendApprovalEmail(String toEmail, String centerName, String ownerName) {
        try {
            Context context = new Context();
            context.setVariable("ownerName", ownerName);
            context.setVariable("centerName", centerName);
            context.setVariable("ownerPortalUrl", frontendUrl + "/owner");

            sendTemplateEmail(
                    toEmail,
                    "Your Center Application Approved - " + centerName,
                    "owner-approval-email",
                    context);
            log.info("Approval notification sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send approval email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send approval email", e);
        }
    }

    /**
     * Send center application rejection notification
     */
    public void sendRejectionEmail(String toEmail, String centerName, String ownerName, String reviewNotes) {
        try {
            Context context = new Context();
            context.setVariable("ownerName", ownerName);
            context.setVariable("centerName", centerName);
            context.setVariable("reviewNotes", reviewNotes == null ? "" : reviewNotes);

            sendTemplateEmail(
                    toEmail,
                    "Your Center Application - Update Required - " + centerName,
                    "owner-rejection-email",
                    context);
            log.info("Rejection notification sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send rejection email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send rejection email", e);
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
