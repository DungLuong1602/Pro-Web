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
    public void deleteFile(String fileUrl) throws Exception {
        // 1. Trích xuất publicId từ URL
        // Ví dụ URL: https://res.cloudinary.com/demo/video/upload/v12345/folder/song_name.mp3
        // Chúng ta cần lấy phần: "folder/song_name"
        String publicId = extractPublicIdFromUrl(fileUrl);

        // 2. Gọi Cloudinary xóa
        // Lưu ý: File MP3 trên Cloudinary thường được coi là resource_type = "video"
        cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "video"));
    }

    private String extractPublicIdFromUrl(String url) {
        // Logic lấy phần đường dẫn sau /upload/v.../
        String[] parts = url.split("/");
        String filenameWithExt = parts[parts.length - 1]; // "song_name.mp3"
        String filename = filenameWithExt.substring(0, filenameWithExt.lastIndexOf('.')); // "song_name"
        
        // Nếu bạn có để trong folder, bạn cần logic lấy thêm folder nữa. 
        // Nếu chỉ upload ngang hàng, thì return filename là đủ.
        return filename; 
    }
}