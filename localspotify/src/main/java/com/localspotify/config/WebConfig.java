package com.localspotify.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho mọi API Endpoint (vd: /api/v1/...)
                .allowedOriginPatterns("*") // Cho phép mọi nguồn gọi tới (thích hợp cho dev local)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức HTTP được phép
                .allowedHeaders("*") // Cho phép mọi Header
                .allowCredentials(true); // Cho phép gửi Cookie hoặc thông tin xác thực (quan trọng cho Login)
    }
}