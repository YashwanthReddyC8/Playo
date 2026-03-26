package com.pm.adminservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OwnerEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@playo.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Send password reset email for new owner accounts
     */
    public void sendPasswordResetEmail(String toEmail, String ownerName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your Playo Owner Account Created - Set Your Password");
            message.setText("Hello " + ownerName + ",\n\n" +
                    "Your sports center application has been approved! 🎉\n\n" +
                    "An account has been created for you. Please click the link below to set up your password:\n" +
                    frontendUrl + "/forgot-password\n\n" +
                    "Simply enter your email address to receive the password reset link.\n" +
                    "You will then be able to log in and manage your center.\n\n" +
                    "If you didn't request this account, please contact our support team.\n\n" +
                    "Best regards,\n" +
                    "Playo Team");

            mailSender.send(message);
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
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your Center Application Approved - " + centerName);
            message.setText("Hello " + ownerName + ",\n\n" +
                    "Great news! Your sports center application has been approved! 🎉\n\n" +
                    "Center Name: " + centerName + "\n\n" +
                    "Your account is now ready to use. Here's what you can do:\n" +
                    "• Manage your center profile and information\n" +
                    "• Set booking rates and schedules\n" +
                    "• View member bookings and payments\n" +
                    "• Manage coaching staff and classes\n\n" +
                    "To get started, visit: " + frontendUrl + "/owner\n\n" +
                    "If you have any questions, our support team is here to help.\n\n" +
                    "Best regards,\n" +
                    "Playo Team");

            mailSender.send(message);
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
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your Center Application - Update Required - " + centerName);
            message.setText("Hello " + ownerName + ",\n\n" +
                    "Thank you for submitting your sports center application to Playo.\n\n" +
                    "Center Name: " + centerName + "\n\n" +
                    "Unfortunately, your application has been reviewed and requires further attention:\n\n" +
                    (reviewNotes != null && !reviewNotes.isEmpty() ? "Review Notes:\n" + reviewNotes + "\n\n" : "") +
                    "We encourage you to:\n" +
                    "• Review the feedback carefully\n" +
                    "• Update your application with the required information\n" +
                    "• Resubmit for review\n\n" +
                    "If you have any questions or need clarification on the feedback, please contact our support team at support@playo.com.\n\n"
                    +
                    "Best regards,\n" +
                    "Playo Team");

            mailSender.send(message);
            log.info("Rejection notification sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send rejection email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send rejection email", e);
        }
    }
}
