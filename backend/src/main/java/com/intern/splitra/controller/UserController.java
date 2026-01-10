package com.intern.splitra.controller;

import com.intern.splitra.constant.UserApiEndpointConstants;
import com.intern.splitra.dto.UserDto;
import com.intern.splitra.model.User;
import com.intern.splitra.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    UserService userService;

    @PostMapping(UserApiEndpointConstants.SIGN_UP)
    public ResponseEntity<UserDto> createUser (@RequestBody UserDto userDto) {
        return userService.createUser(userDto);
    }

    @PostMapping(UserApiEndpointConstants.LOGIN)
    public ResponseEntity<String>login(@RequestBody User user){
        return userService.verify(user);
    }

    @GetMapping(UserApiEndpointConstants.USERS)
    public ResponseEntity<List<UserDto>> getAllUsers(){
        var users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
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

}
