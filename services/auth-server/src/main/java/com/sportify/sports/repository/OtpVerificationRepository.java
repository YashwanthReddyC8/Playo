package com.sportify.sports.repository;

import com.sportify.sports.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByEmailAndIsVerifiedFalse(String email);

    Optional<OtpVerification> findByEmail(String email);

    void deleteByEmail(String email);
}
