package com.pm.adminservice.service;

import com.sportify.commonmodels.entity.Role;
import com.sportify.commonmodels.entity.User;
import com.sportify.commonmodels.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OwnerAccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OwnerEmailService emailService;

    /**
     * Create an OWNER account for center application approval
     * Sends password reset link via email for initial password setup
     */
    @Transactional
    public User createOrUpdateOwnerAccount(String email, String name, String phone) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Update to OWNER role if not already
            if (user.getRole() != Role.OWNER) {
                user.setRole(Role.OWNER);
                user = userRepository.save(user);
                log.info("Updated existing account to OWNER role: {}", email);
            }
        } else {
            // Create new OWNER account with temporary password
            user = User.builder()
                    .email(email)
                    .name(name)
                    .phone(phone)
                    .role(Role.OWNER)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .build();

            user = userRepository.save(user);
            log.info("Created new OWNER account: {}", email);
        }

        return user;
    }

    /**
     * Trigger password reset email for new owner account
     */
    @Transactional
    public void sendPasswordResetEmail(String email, String name) {
        try {
            emailService.sendPasswordResetEmail(email, name);
            log.info("Password reset email sent to owner: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", email, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    /**
     * Send approval notification to owner
     */
    @Transactional
    public void sendApprovalEmail(String email, String centerName, String ownerName) {
        try {
            emailService.sendApprovalEmail(email, centerName, ownerName);
            log.info("Approval notification sent to owner: {}", email);
        } catch (Exception e) {
            log.error("Failed to send approval email to: {}", email, e);
            throw new RuntimeException("Failed to send approval email", e);
        }
    }

    /**
     * Send rejection notification to owner
     */
    @Transactional
    public void sendRejectionEmail(String email, String centerName, String ownerName, String reviewNotes) {
        try {
            emailService.sendRejectionEmail(email, centerName, ownerName, reviewNotes);
            log.info("Rejection notification sent to owner: {}", email);
        } catch (Exception e) {
            log.error("Failed to send rejection email to: {}", email, e);
            throw new RuntimeException("Failed to send rejection email", e);
        }
    }
}
