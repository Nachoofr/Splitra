package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.QrCodeDto;
import com.intern.splitra.dto.UserDto;
import com.intern.splitra.mapper.UserMapper;
import com.intern.splitra.model.QrCode;
import com.intern.splitra.model.User;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.SecurityService.JwtService;
import com.intern.splitra.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private JwtService jwtService;
    AuthenticationManager authManager;
    UserMapper userMapper;
    UserRepo userRepo;
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public ResponseEntity<UserDto> createUser(UserDto userDto) {
        var user = userMapper.toEntity(userDto);
        user.setActive(true);
        user.setPassword(encoder.encode(user.getPassword()));
        userRepo.save(user);
        return new ResponseEntity<>(userMapper.toDto(user), HttpStatus.OK);
    }

    public List<UserDto> getAllUsers() {
        return  userRepo.findAll().stream()
                .map(userMapper::toDto)
                .toList();
    }

    public ResponseEntity<UserDto> getUserById(Long id) {
        Optional<User> optionalUser = userRepo.findById(id);
        if (optionalUser.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        UserDto userDto = userMapper.toDto(optionalUser.get());
        return new ResponseEntity<>(userDto, HttpStatus.OK);
    }

    public ResponseEntity<UserDto> updateUser(UserDto userDto, Long id) {
        Optional<User> optionalUser = userRepo.findById(id);
        if (optionalUser.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        User user = optionalUser.get();
        user.setActive(true);
        userMapper.update(userDto, user);

        if (userDto.getQrCodes() != null) {
            user.getQrCodes().clear();

            for (QrCodeDto qrDto : userDto.getQrCodes()) {
                QrCode qr = new QrCode();
                qr.setLabel(qrDto.getLabel());
                qr.setQrImageData(qrDto.getQrImageData());
                qr.setUser(user);
                user.getQrCodes().add(qr);
            }
        }
        userRepo.save(user);
        return new ResponseEntity<>(userMapper.toDto(user), HttpStatus.OK);
    }

    public ResponseEntity<UserDto> deleteUser(Long id) {
        Optional<User> optionalUser = userRepo.findByIdAndActiveTrue(id);
        if (optionalUser.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        User user = optionalUser.get();
        user.setActive(false);
        userRepo.save(user);
        return new ResponseEntity<>(userMapper.toDto(user), HttpStatus.OK);
    }

    public ResponseEntity<String> verify(User user) {
        try {
            Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );

            if (authentication.isAuthenticated()) {
                String token = jwtService.generateToken(user.getEmail());
                return ResponseEntity.ok(token);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("fail");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("fail");
        }
    }


}
