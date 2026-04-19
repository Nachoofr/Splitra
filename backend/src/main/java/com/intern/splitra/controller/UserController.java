package com.intern.splitra.controller;

import com.intern.splitra.constant.UserApiEndpointConstants;
import com.intern.splitra.dto.*;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.model.User;
import com.intern.splitra.service.UserService;
import com.intern.splitra.service.VerificationService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    UserService userService;
    VerificationService verificationService;

    @PostMapping(UserApiEndpointConstants.SIGN_UP)
    public ResponseEntity<UserDto> createUser (@RequestBody UserDto userDto) {
        return userService.createUser(userDto);
    }

    @PostMapping(UserApiEndpointConstants.LOGIN)
    public ResponseEntity<String>login(@RequestBody User user){
        System.out.println("Login request received for user: " + user.getEmail());
        return userService.verify(user);
    }

    @GetMapping(UserApiEndpointConstants.USERS)
    public ResponseEntity<List<UserDto>> getAllUsers(){
        var users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping(UserApiEndpointConstants.CURRENT_USER)
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserPrinciple userPrinciple){
        long userId = userPrinciple.getUser().getId();
        return userService.getUserById(userId);
    }

    @GetMapping(UserApiEndpointConstants.USER_ID)
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id){
        return userService.getUserById(id);
    }

    @PostMapping(UserApiEndpointConstants.USER_ID)
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto userDto){
        return userService.updateUser(userDto, id);
    }

    @DeleteMapping(UserApiEndpointConstants.USER_ID)
    public ResponseEntity<UserDto> deleteUser(@PathVariable Long id){
        return userService.deleteUser(id);
    }

    @PostMapping("/splitra/users/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordDto resetPasswordDto,
                                              @AuthenticationPrincipal UserPrinciple userPrinciple) {
        long userId = userPrinciple.getUser().getId();
        return userService.resetPassword(userId, resetPasswordDto.getCurrentPassword(), resetPasswordDto.getNewPassword());
    }

    @PostMapping("/splitra/users/send-verification")
    public ResponseEntity<Void> sendVerification(@RequestBody SendVerificationDto dto) {
        return verificationService.sendVerificationCode(dto.getEmail(), dto.getPurpose());
    }

    @PostMapping("/splitra/users/verify-code")
    public ResponseEntity<Void> verifyCode(@RequestBody VerifyEmailDto dto) {
        return verificationService.verifyCode(dto.getEmail(), dto.getCode(), dto.getPurpose());
    }

    @PostMapping("/splitra/users/forgot-password-reset")
    public ResponseEntity<Void> forgotPasswordReset(@RequestBody ForgotPasswordResetDto dto) {
        return userService.resetPasswordWithCode(dto.getEmail(), dto.getCode(), dto.getNewPassword());
    }
}