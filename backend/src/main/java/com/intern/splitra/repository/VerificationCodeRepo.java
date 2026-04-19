package com.intern.splitra.repository;

import com.intern.splitra.model.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationCodeRepo extends JpaRepository<VerificationCode, Long> {
    Optional<VerificationCode> findTopByEmailAndPurposeAndUsedFalseOrderByExpiresAtDesc(String email, String purpose);
    void deleteAllByEmail(String email);
}