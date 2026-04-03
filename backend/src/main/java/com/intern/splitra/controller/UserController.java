package com.intern.splitra.controller;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.intern.splitra.constant.UserApiEndpointConstants;
import com.intern.splitra.dto.UserDto;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.model.User;
import com.intern.splitra.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @PostMapping(UserApiEndpointConstants.SIGN_UP)
    public ResponseEntity<UserDto> createUser (@RequestBody UserDto userDto) {
        return userService.createUser(userDto);
    }

    @PostMapping(UserApiEndpointConstants.LOGIN)
    public ResponseEntity<String>login(@RequestBody User user){


//        // test Gemini API call
//        // The client gets the API key from the environment variable `GEMINI_API_KEY`.
//        try{
//            Client client = Client.builder()
//                    .apiKey("AIzaSyDiRbEwWs7Xyp2yTDYY4aSF1yfRz0wv-hc")
//                    .build();
//
//            GenerateContentResponse response =
//                    client.models.generateContent(
//                            "gemini-3-flash-preview",
//                            "Explain how AI works in a few words",
//                            null);
//
//            System.out.println(response.text());
//        }
//        catch(Exception e){
//            System.out.println("Error calling Gemini API: " + e.getMessage());
//        }


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

}
