package com.intern.splitra.service.implementation;

import com.intern.splitra.service.EmailService;
import lombok.AllArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationCode(String email, String code, String purpose) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);

        if ("SIGNUP".equals(purpose)) {
            message.setSubject("Splitra - Email Verification Code");
            message.setText(
                    "Welcome to Splitra!\n\n" +
                            "Your email verification code is: " + code + "\n\n" +
                            "This code will expire in 10 minutes.\n\n" +
                            "If you did not create a Splitra account, please ignore this email."
            );
        } else {
            message.setSubject("Splitra - Password Reset Code");
            message.setText(
                    "Hi,\n\n" +
                            "You requested to reset your Splitra password.\n\n" +
                            "Your password reset code is: " + code + "\n\n" +
                            "This code will expire in 10 minutes.\n\n" +
                            "If you did not request a password reset, please ignore this email."
            );
        }

        mailSender.send(message);
    }
}