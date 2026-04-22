package com.intern.splitra.service;

import com.intern.splitra.dto.UserDto;
import com.intern.splitra.mapper.UserMapper;
import com.intern.splitra.model.User;
import com.intern.splitra.model.VerificationCode;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.repository.VerificationCodeRepo;
import com.intern.splitra.service.SecurityService.JwtService;
import com.intern.splitra.service.implementation.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authManager;
    @Mock private UserMapper userMapper;
    @Mock private UserRepo userRepo;
    @Mock private VerificationCodeRepo verificationCodeRepo;
    @Mock private BCryptPasswordEncoder encoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setFullName("John Doe");
        testUser.setEmail("john@example.com");
        testUser.setPhone("9800000000");
        testUser.setPassword("encoded_password");
        testUser.setActive(true);
    }

    @Test
    void verify_WhenCredentialsValid_ShouldReturnToken() {
        User loginUser = new User();
        loginUser.setEmail("john@example.com");
        loginUser.setPassword("plaintext");

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtService.generateToken("john@example.com")).thenReturn("jwt-token-123");

        ResponseEntity<String> response = userService.verify(loginUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("jwt-token-123", response.getBody());
        verify(jwtService).generateToken("john@example.com");
    }

    @Test
    void verify_WhenWrongPwIsEntered_ShouldReturnUnauthorized() {
        User loginUser = new User();
        loginUser.setEmail("john@example.com");
        loginUser.setPassword("wrongpassword");

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(false);
        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);

        ResponseEntity<String> response = userService.verify(loginUser);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("fail", response.getBody());
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void resetPassword_WhenUserNotFound_ShouldReturn404() {
        when(userRepo.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<Void> response = userService.resetPassword(99L, "current", "newpass");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(encoder, never()).matches(any(), any());
        verify(userRepo, never()).save(any());
    }

    @Test
    void resetPassword_WhenCurrentPasswordWrong_ShouldReturnUnauthorized() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));
        when(encoder.matches("wrongcurrent", "encoded_password")).thenReturn(false);

        ResponseEntity<Void> response = userService.resetPassword(1L, "wrongcurrent", "newpass");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(userRepo, never()).save(any());
    }

    @Test
    void resetPassword_WhenCurrentPasswordCorrect_ShouldUpdateAndReturn200() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));
        when(encoder.matches("currentpass", "encoded_password")).thenReturn(true);
        when(encoder.encode("newpass")).thenReturn("new_encoded");
        when(userRepo.save(any(User.class))).thenReturn(testUser);

        ResponseEntity<Void> response = userService.resetPassword(1L, "currentpass", "newpass");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("new_encoded", testUser.getPassword());
        verify(userRepo).save(testUser);
    }
}