package com.sportify.sports.service;

import com.sportify.sports.entity.OtpVerification;
import com.sportify.sports.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDateTime;
import java.util.Random;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {
    private final OtpVerificationRepository otpRepository;
    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@playo.com}")
    private String fromEmail;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 3;

    /**
     * Generate and send OTP to email
     */
    @Transactional
    public void sendOtp(String email) throws Exception {
        try {
            // Generate OTP
            String otp = generateOtp();

            // Reuse the existing record when the email already has a pending OTP
            OtpVerification otpVerification = otpRepository.findByEmail(email)
                .orElseGet(OtpVerification::new);

            otpVerification.setEmail(email);
            otpVerification.setOtp(otp);
            otpVerification.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
            otpVerification.setAttempts(0);
            otpVerification.setIsVerified(false);

            otpRepository.save(otpVerification);

            // Send OTP via email
            try {
                sendOtpEmail(email, otp, OTP_EXPIRY_MINUTES);
                log.info("OTP sent successfully to: {}", email);
            } catch (Exception e) {
                // Clean up if email fails
                otpRepository.delete(otpVerification);
                log.error("Failed to send OTP email to: {}", email, e);
                throw new Exception("Failed to send OTP email. Please try again.");
            }
        } catch (Exception e) {
            log.error("Error in sendOtp: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Verify OTP
     */
    @Transactional
    public boolean verifyOtp(String email, String otp) throws Exception {
        OtpVerification otpVerification = otpRepository.findByEmailAndIsVerifiedFalse(email)
                .orElseThrow(() -> new Exception("OTP not found for email: " + email));

        // Check expiry
        if (LocalDateTime.now().isAfter(otpVerification.getExpiresAt())) {
            otpRepository.delete(otpVerification);
            throw new Exception("OTP has expired. Please request a new OTP.");
        }

        // Check attempts
        if (otpVerification.getAttempts() >= MAX_ATTEMPTS) {
            otpRepository.delete(otpVerification);
            throw new Exception("Max OTP attempts exceeded. Please request a new OTP.");
        }

        // Verify OTP
        if (!otpVerification.getOtp().equals(otp)) {
            otpVerification.setAttempts(otpVerification.getAttempts() + 1);
            otpRepository.save(otpVerification);
            int remaining = MAX_ATTEMPTS - otpVerification.getAttempts();
            throw new Exception("Invalid OTP. " + remaining + " attempts remaining.");
        }

        // Mark as verified
        otpVerification.setIsVerified(true);
        otpRepository.save(otpVerification);
        log.info("OTP verified successfully for: {}", email);
        return true;
    }

    /**
     * Get verified OTP record
     */
    public OtpVerification getVerifiedOtp(String email) throws Exception {
        OtpVerification otpVerification = otpRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("OTP verification not found for email: " + email));

        if (!otpVerification.getIsVerified()) {
            throw new Exception("OTP has not been verified yet");
        }

        return otpVerification;
    }

    /**
     * Clean up verified OTP after account creation
     */
    @Transactional
    public void deleteOtp(String email) {
        otpRepository.deleteByEmail(email);
        log.info("OTP deleted for: {}", email);
    }

    /**
     * Generate random 6-digit OTP
     */
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Send OTP email
     */
    private void sendOtpEmail(String toEmail, String otp, int expiryMinutes) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your OTP for Playo Registration - " + otp);
            message.setText(
                    "Welcome to Playo!\n\n" +
                            "Your OTP for registration is: " + otp + "\n\n" +
                            "This OTP will expire in " + expiryMinutes + " minutes.\n" +
                            "Do not share this OTP with anyone.\n\n" +
                            "If you didn't request this OTP, please ignore this email.\n\n" +
                            "Thank you,\n" +
                            "Playo Team");
            mailSender.send(message);
            log.info("OTP email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send OTP email");
        }
    }
}
