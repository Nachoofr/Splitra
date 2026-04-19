package com.intern.splitra.service;

public interface EmailService {
    void sendVerificationCode(String email, String code, String purpose);
}