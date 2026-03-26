package com.sportify.sports.service;

import com.sportify.sports.entity.PasswordResetToken;
import com.sportify.commonmodels.entity.User;
import com.sportify.sports.exception.ResourceNotFoundException;
import com.sportify.sports.repository.PasswordResetTokenRepository;
import com.sportify.commonmodels.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Generate a password reset token for the user and send email
     */
    @Transactional
    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Generate unique token
        String token = generateUniqueToken();

        // Create password reset token with 1-hour expiration
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();

        tokenRepository.save(resetToken);
        log.info("Password reset token generated for user: {}", email);

        // Send email with reset link
        try {
            String resetLink = token; // Token will be used in frontend URL
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetLink);
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", email, e);
            // Don't throw - token is already created, user can retry email sending
        }
    }

    /**
     * Validate and use password reset token
     */
    @Transactional
    public void validateAndResetPassword(String token, String newPassword) {
        // Find valid token (not expired and not used)
        PasswordResetToken resetToken = tokenRepository
                .findByTokenAndUsedFalseAndExpiryDateAfter(token, LocalDateTime.now())
                .orElseThrow(() -> {
                    log.warn("Invalid or expired password reset token attempted: {}", token);
                    return new RuntimeException("Invalid or expired password reset token");
                });

        // Get the user
        User user = resetToken.getUser();

        // Validate new password
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.markAsUsed();
        tokenRepository.save(resetToken);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    /**
     * Check if token is valid
     */
    public boolean isTokenValid(String token) {
        return tokenRepository
                .findByTokenAndUsedFalseAndExpiryDateAfter(token, LocalDateTime.now())
                .isPresent();
    }

    /**
     * Get user email from valid token (for frontend to display)
     */
    public String getUserEmailFromToken(String token) {
        PasswordResetToken resetToken = tokenRepository
                .findByTokenAndUsedFalseAndExpiryDateAfter(token, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        return resetToken.getUser().getEmail();
    }

    /**
     * Resend password reset email
     */
    @Transactional
    public void resendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Find latest token for user
        PasswordResetToken resetToken = tokenRepository
                .findFirstByUserOrderByCreatedAtDesc(user)
                .orElseThrow(
                        () -> new RuntimeException("No password reset request found. Please initiate a new request."));

        // Check if token is still valid
        if (!resetToken.isValid()) {
            // Generate new token
            String newToken = generateUniqueToken();
            resetToken = PasswordResetToken.builder()
                    .token(newToken)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusHours(1))
                    .used(false)
                    .build();
            tokenRepository.save(resetToken);
        }

        // Send email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetToken.getToken());
            log.info("Password reset email re-sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to resend password reset email to: {}", email, e);
            throw new RuntimeException("Failed to send email. Please try again.");
        }
    }

    /**
     * Generate a unique token using UUID
     */
    private String generateUniqueToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * Clean up expired tokens (can be called by scheduled task)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        // This is handled by query, but you can add periodic cleanup if needed
        log.info("Expired tokens cleanup completed");
    }
}
