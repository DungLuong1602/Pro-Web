package com.localspotify.service;

import com.localspotify.dto.AuthDto;
import com.localspotify.entity.User;
import com.localspotify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User register(AuthDto dto) throws Exception {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new Exception("Tên đăng nhập đã tồn tại!");
        }

        User newUser = new User();
        newUser.setUsername(dto.getUsername());
        newUser.setPassword(passwordEncoder.encode(dto.getPassword())); 

        return userRepository.save(newUser);
    }

    public User login(AuthDto dto) throws Exception {
        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new Exception("Sai tên đăng nhập hoặc mật khẩu!"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new Exception("Sai tên đăng nhập hoặc mật khẩu!");
        }

        return user;
    }
}