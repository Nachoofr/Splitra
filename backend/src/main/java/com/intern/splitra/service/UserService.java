package com.intern.splitra.service;

import com.intern.splitra.dto.UserDto;
import com.intern.splitra.model.User;
import org.springframework.http.ResponseEntity;

import java.util.List;


public interface UserService {
    ResponseEntity<UserDto> createUser(UserDto userDto);
    List<UserDto> getAllUsers();
    ResponseEntity<UserDto> getUserById(Long id);
    ResponseEntity<UserDto> updateUser(UserDto userDto, Long id);
    ResponseEntity<UserDto> deleteUser(Long id);
    ResponseEntity<String> verify(User user);
}
