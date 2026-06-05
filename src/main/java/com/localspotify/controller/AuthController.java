package com.localspotify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.localspotify.dto.ApiResponse;
import com.localspotify.dto.AuthDto;
import com.localspotify.entity.User;
import com.localspotify.service.AuthService;

@RestController
@RequestMapping("/api/auth") 
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody AuthDto dto) {
        try {
            User savedUser = authService.register(dto);
            savedUser.setPassword(null); 
            
            return ResponseEntity.ok(new ApiResponse<>(200, "Đăng ký thành công!", savedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@RequestBody AuthDto dto) {
        try {
            User user = authService.login(dto);
            user.setPassword(null);
            
            return ResponseEntity.ok(new ApiResponse<>(200, "Đăng nhập thành công!", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}