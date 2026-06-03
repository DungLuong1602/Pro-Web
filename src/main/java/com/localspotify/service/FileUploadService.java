package com.localspotify.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@Service
public class FileUploadService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadSong(MultipartFile file) throws IOException {
        // Tham số "resource_type", "video" được dùng chung cho cả file audio (mp3) trên Cloudinary
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                ObjectUtils.asMap("resource_type", "video"));
        
        // Trả về một URL HTTPS trực tuyến an toàn
        return uploadResult.get("secure_url").toString(); 
    }
}