package com.intern.splitra.controller;

import com.intern.splitra.dto.UserDto;
import com.intern.splitra.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
public class UserController {
    UserService userService;

    @PostMapping("/splitra/users")
    public ResponseEntity<UserDto> createUser (@RequestBody UserDto userDto) {
        return userService.createUser(userDto);
    }

    @GetMapping("/splitra/users")
    public ResponseEntity<List<UserDto>> getAllUsers(){
        var users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/splitra/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id){
        return userService.getUserById(id);
    }

    @PostMapping("/splitra/users/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto userDto){
        return userService.updateUser(userDto, id);
    }

    @DeleteMapping("/splitra/users/{id}")
    public ResponseEntity<UserDto> deleteUser(@PathVariable Long id){
        return userService.deleteUser(id);
    }




}
