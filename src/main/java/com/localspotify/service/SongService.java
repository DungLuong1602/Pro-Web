package com.localspotify.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.localspotify.entity.Song;
import com.localspotify.entity.User;
import com.localspotify.repository.SongRepository;

@Service
public class SongService {

    @Autowired
    private SongRepository songRepository;
    @Autowired
    private FileUploadService fileUploadService;
    // Đã xóa biến uploadDir vì không còn lưu file local nữa

    // Hàm mới thay thế cho uploadSong cũ - Nhận URL từ Cloudinary truyền xuống
    public Song saveSongMetadata(String title, String artist, String fileUrl, String originalFilename, long fileSize, User uploadedBy) {
        // Vẫn giữ nguyên logic lấy tên file mặc định cực xịn của nhóm
        String finalTitle = title != null && !title.trim().isEmpty() ? title.trim() : originalFilename;
        String finalArtist = artist != null && !artist.trim().isEmpty() ? artist.trim() : "Unknown Artist";

        // Vẫn giữ logic chặn trùng bài hát
        if (songRepository.existsByTitleIgnoreCaseAndArtistIgnoreCase(finalTitle, finalArtist)) {
            throw new IllegalArgumentException("Bài hát đã tồn tại trong hệ thống.");
        }

        // Tạo thực thể Song
        Song song = new Song();
        song.setTitle(finalTitle);
        song.setArtist(finalArtist);
        song.setFilePath(fileUrl); // Quan trọng: Bây giờ filePath sẽ chứa URL của Cloudinary
        song.setFileSize(fileSize);
        song.setUploadedBy(uploadedBy);
        song.setIsPublic(true);

        return songRepository.save(song);
    }

    public Song getSongById(Long id) {
        return songRepository.findById(id).orElse(null);
    }

    public List<Song> getAllPublicSongs() {
        return songRepository.findByIsPublicTrue();
    }

    public List<Song> searchSongs(String query) {
        List<Song> results = songRepository.findByTitleContainingIgnoreCase(query);
        results.addAll(songRepository.findByArtistContainingIgnoreCase(query));
        return results;
    }

    public void incrementListenCount(Long songId) {
        Song song = songRepository.findById(songId).orElse(null);
        if (song != null) {
            song.setListenCount(song.getListenCount() + 1);
            songRepository.save(song);
        }
    }

    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    public Song updateSong(Long id, String title, String artist) {
        Song song = songRepository.findById(id).orElse(null);
        if (song != null) {
            if (title != null && !title.trim().isEmpty()) {
                song.setTitle(title);
            }
            if (artist != null && !artist.trim().isEmpty()) {
                song.setArtist(artist);
            }
            song.setUpdatedAt(java.time.LocalDateTime.now());
            return songRepository.save(song);
        }
        return null;
    }
    
    public void deleteSong(Long id, Long userId) {
        Song song = songRepository.findById(id).orElse(null);
        
        if (song == null) {
            throw new RuntimeException("Bài hát không tồn tại.");
        }

        // 1. Kiểm tra nếu bài hát CÓ chủ
        if (song.getUploadedBy() != null) {
            // Kiểm tra quyền sở hữu
            if (!song.getUploadedBy().getId().equals(userId)) {
                throw new RuntimeException("Bạn không có quyền xóa bài hát này!");
            }
        } else {
            // 2. Nếu bài hát KHÔNG CÓ chủ (bài nhạc cũ), bạn có thể cho phép chỉ Admin (ID 1) xóa
            if (userId != 1L) {
                throw new RuntimeException("Bạn không có quyền xóa bài hát này!");
            }
        }

        // 3. Dọn dẹp trên Cloud
        try {
            if (song.getFilePath() != null) {
                fileUploadService.deleteFile(song.getFilePath());
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi xóa file trên Cloudinary: " + e.getMessage());
        }

        // 4. Xóa trong Database
        songRepository.delete(song);
    }
}
