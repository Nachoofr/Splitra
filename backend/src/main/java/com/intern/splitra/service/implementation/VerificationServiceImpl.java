package com.intern.splitra.service.implementation;

import com.intern.splitra.model.VerificationCode;
import com.intern.splitra.repository.VerificationCodeRepo;
import com.intern.splitra.service.EmailService;
import com.intern.splitra.service.VerificationService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@AllArgsConstructor
public class VerificationServiceImpl implements VerificationService {

    private final VerificationCodeRepo verificationCodeRepo;
    private final EmailService emailService;

    @Override
    @Transactional
    public ResponseEntity<Void> sendVerificationCode(String email, String purpose) {
        verificationCodeRepo.deleteAllByEmail(email);

        String code = String.format("%06d", new Random().nextInt(999999));

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(email);
        verificationCode.setCode(code);
        verificationCode.setPurpose(purpose);
        verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        verificationCode.setUsed(false);
        verificationCodeRepo.save(verificationCode);

        emailService.sendVerificationCode(email, code, purpose);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Void> verifyCode(String email, String code, String purpose) {
        Optional<VerificationCode> optCode = verificationCodeRepo
                .findTopByEmailAndPurposeAndUsedFalseOrderByExpiresAtDesc(email, purpose);

        if (optCode.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        VerificationCode vc = optCode.get();

        if (vc.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new ResponseEntity<>(HttpStatus.GONE);
        }

        if (!vc.getCode().equals(code)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        if (!"FORGOT_PASSWORD".equals(purpose)) {
            vc.setUsed(true);
            verificationCodeRepo.save(vc);
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }
}