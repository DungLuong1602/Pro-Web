package com.localspotify.controller;

import java.io.File;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.localspotify.dto.ApiResponse;
import com.localspotify.entity.Song;
import com.localspotify.entity.User;
import com.localspotify.repository.UserRepository;
import com.localspotify.service.SongService;
@RestController
@RequestMapping("/api/songs")
@CrossOrigin(originPatterns = "*")
public class SongController {

    @Autowired
    private SongService songService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Tải lên bài hát mới
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Song>> uploadSong(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "artist", required = false) String artist,
            @RequestParam(value = "userId", required = false) Long userId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(400, "File is empty", null));
            }

            // Lấy người dùng hiện tại (mặc định user ID 1 tạm thời)
            User uploadedBy = null;
            if (userId != null) {
                uploadedBy = userRepository.findById(userId).orElse(null);
            }
            if (uploadedBy == null) {
                uploadedBy = userRepository.findById(1L).orElse(null);
            }

            Song song = songService.uploadSong(file, title, artist, uploadedBy);
            return ResponseEntity.ok(new ApiResponse<>(200, "Upload successful", song));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(500, "Lỗi server: " + e.getMessage(), null));
        }
    }

    /**
     * Lấy tất cả bài hát
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Song>>> getAllSongs() {
        try {
            List<Song> songs = songService.getAllSongs();
            return ResponseEntity.ok(new ApiResponse<>(200, "Success", songs));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(500, e.getMessage(), null));
        }
    }

    /**
     * Lấy bài hát theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Song>> getSongById(@PathVariable Long id) {
        try {
            Song song = songService.getSongById(id);
            if (song == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(404, "Song not found", null));
            }
            return ResponseEntity.ok(new ApiResponse<>(200, "Success", song));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(500, e.getMessage(), null));
        }
    }

    /**
     * Phát trực tuyến tệp âm thanh của bài hát
     */
    @GetMapping("/{id}/stream")
    public ResponseEntity<Resource> streamSong(@PathVariable Long id) {
        try {
            Song song = songService.getSongById(id);
            if (song == null) {
                return ResponseEntity.notFound().build();
            }

            File audioFile = new File(song.getFilePath());
            if (!audioFile.exists()) {
                return ResponseEntity.notFound().build();
            }

            // Tăng số lần nghe
            songService.incrementListenCount(id);

            Resource resource = new FileSystemResource(audioFile);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + song.getTitle() + ".mp3\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Tìm kiếm bài hát
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Song>>> searchSongs(
            @RequestParam(value = "q", required = false) String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.ok(new ApiResponse<>(200, "Success", songService.getAllSongs()));
            }
            List<Song> songs = songService.searchSongs(query);
            return ResponseEntity.ok(new ApiResponse<>(200, "Success", songs));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(500, e.getMessage(), null));
        }
    }
    /**
     * Cập nhật thông tin bài hát (Sửa tiêu đề và nghệ sĩ)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Song>> updateSong(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "artist", required = false) String artist) {
        try {
            Song updatedSong = songService.updateSong(id, title, artist);
            if (updatedSong == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(404, "Song not found", null));
            }
            return ResponseEntity.ok(new ApiResponse<>(200, "Song updated successfully", updatedSong));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(500, e.getMessage(), null));
        }
    }
    /**
     * Xóa bài hát
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSong(@PathVariable Long id) {
        try {
            songService.deleteSong(id);
            return ResponseEntity.ok(new ApiResponse<>(200, "Song deleted successfully", "Success"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(500, e.getMessage(), null));
        }
    }
}
