package com.localspotify.controller;

import com.localspotify.dto.ApiResponse;
import com.localspotify.dto.AuthDto;
import com.localspotify.entity.User;
import com.localspotify.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") 
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