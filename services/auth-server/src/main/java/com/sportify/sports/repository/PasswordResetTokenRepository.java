package com.sportify.sports.repository;

import com.sportify.sports.entity.PasswordResetToken;
import com.sportify.commonmodels.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Find a valid (not expired, not used) password reset token by token string
     */
    Optional<PasswordResetToken> findByTokenAndUsedFalseAndExpiryDateAfter(
            String token,
            LocalDateTime now);

    /**
     * Find a token by its string value
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Find latest token for a user
     */
    Optional<PasswordResetToken> findFirstByUserOrderByCreatedAtDesc(User user);

    /**
     * Delete all used tokens for a user
     */
    void deleteByUserAndUsedTrue(User user);

    /**
     * Delete expired tokens that have been used (cleanup method)
     */
    void deleteByExpiryDateBeforeAndUsedTrue(LocalDateTime expiryDate);
}
