package com.intern.splitra.service;

import com.intern.splitra.dto.UserDto;
import com.intern.splitra.mapper.UserMapper;
import com.intern.splitra.model.User;
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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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
    private UserDto testUserDto;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setFullName("John Doe");
        testUser.setEmail("john@example.com");
        testUser.setPhone("9800000000");
        testUser.setPassword("encoded_password");
        testUser.setActive(true);

        testUserDto = new UserDto();
        testUserDto.setFullName("John Doe");
        testUserDto.setEmail("john@example.com");
        testUserDto.setPhone("9800000000");
        testUserDto.setPassword("plaintext");
    }

    @Test
    void createUser_ShouldReturnCreatedUser() {
        testUser.setPassword("plaintext");

        when(userMapper.toEntity(testUserDto)).thenReturn(testUser);
        when(encoder.encode("plaintext")).thenReturn("encoded_password");
        when(userRepo.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toDto(testUser)).thenReturn(testUserDto);

        ResponseEntity<UserDto> response = userService.createUser(testUserDto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepo, times(1)).save(any(User.class));
        verify(encoder, times(1)).encode("plaintext");
    }

    @Test
    void getUserById_WhenUserExists_ShouldReturnUser() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));
        when(userMapper.toDto(testUser)).thenReturn(testUserDto);

        ResponseEntity<UserDto> response = userService.getUserById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void getUserById_WhenUserNotFound_ShouldReturn404() {
        when(userRepo.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<UserDto> response = userService.getUserById(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deleteUser_WhenUserActive_ShouldSoftDelete() {
        when(userRepo.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(testUser));
        when(userRepo.save(testUser)).thenReturn(testUser);
        when(userMapper.toDto(testUser)).thenReturn(testUserDto);

        ResponseEntity<UserDto> response = userService.deleteUser(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(testUser.isActive());
        verify(userRepo).save(testUser);
    }
}