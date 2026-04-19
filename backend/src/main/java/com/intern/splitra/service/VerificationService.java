package com.intern.splitra.service;

import org.springframework.http.ResponseEntity;

public interface VerificationService {
    ResponseEntity<Void> sendVerificationCode(String email, String purpose);
    ResponseEntity<Void> verifyCode(String email, String code, String purpose);

}