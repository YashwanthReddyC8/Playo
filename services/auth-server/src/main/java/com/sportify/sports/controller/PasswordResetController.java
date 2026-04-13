package com.sportify.sports.controller;

import com.sportify.sports.dto.ForgotPasswordRequest;
import com.sportify.sports.dto.ResetPasswordRequest;
import com.sportify.sports.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
@Slf4j
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    /**
     * Initiate password reset - Send reset email
     * POST /api/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.initiatePasswordReset(request.getEmail());

            return ResponseEntity.ok(new PasswordResetResponse(
                    true,
                    "Password reset email sent successfully to " + request.getEmail(),
                    request.getEmail()));

        } catch (Exception e) {
            log.error("Error in forgot password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new PasswordResetResponse(
                            false,
                            e.getMessage(),
                            null));
        }
    }

    /**
     * Validate reset token - Check if token is valid (for frontend to validate
     * before showing reset form)
     * GET /api/auth/validate-reset-token/{token}
     */
    @GetMapping("/validate-reset-token/{token}")
    public ResponseEntity<?> validateResetToken(@PathVariable @NotBlank String token) {
        try {
            boolean isValid = passwordResetService.isTokenValid(token);

            if (isValid) {
                String email = passwordResetService.getUserEmailFromToken(token);
                return ResponseEntity.ok(new TokenValidationResponse(
                        true,
                        "Token is valid",
                        email));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new TokenValidationResponse(
                                false,
                                "Token is invalid or expired",
                                null));
            }

        } catch (Exception e) {
            log.error("Error validating token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new TokenValidationResponse(
                            false,
                            "Token is invalid or expired",
                            null));
        }
    }

    /**
     * Reset password - Complete the password reset process
     * POST /api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            // Validate password match
            request.validate();

            // Reset password
            passwordResetService.validateAndResetPassword(request.getToken(), request.getNewPassword());

            return ResponseEntity.ok(new PasswordResetResponse(
                    true,
                    "Password reset successfully. You can now login with your new password.",
                    null));

        } catch (RuntimeException e) {
            log.error("Error resetting password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new PasswordResetResponse(
                            false,
                            e.getMessage(),
                            null));
        }
    }

    /**
     * Resend password reset email
     * POST /api/auth/resend-reset-email
     */
    @PostMapping("/resend-reset-email")
    public ResponseEntity<?> resendResetEmail(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.resendPasswordResetEmail(request.getEmail());

            return ResponseEntity.ok(new PasswordResetResponse(
                    true,
                    "Password reset email re-sent to " + request.getEmail(),
                    request.getEmail()));

        } catch (Exception e) {
            log.error("Error resending reset email: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new PasswordResetResponse(
                            false,
                            e.getMessage(),
                            null));
        }
    }

    // ============ Response DTOs ============

    public static class PasswordResetResponse {
        public final boolean success;
        public final String message;
        public final String email;

        public PasswordResetResponse(boolean success, String message, String email) {
            this.success = success;
            this.message = message;
            this.email = email;
        }
    }

    public static class TokenValidationResponse {
        public final boolean valid;
        public final String message;
        public final String email;

        public TokenValidationResponse(boolean valid, String message, String email) {
            this.valid = valid;
            this.message = message;
            this.email = email;
        }
    }
}
