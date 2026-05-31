package com.localspotify.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.localspotify.entity.Song;
import com.localspotify.entity.User;
import com.localspotify.repository.SongRepository;

@Service
public class SongService {

    @Autowired
    private SongRepository songRepository;

    @Value("${upload.dir:uploads/audio}")
    private String uploadDir;

    public Song uploadSong(MultipartFile file, String title, String artist, User uploadedBy) throws IOException {
        // Tạo thư mục upload nếu chưa tồn tại
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Tạo tên tệp duy nhất
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);

        // Lưu tệp
        Files.copy(file.getInputStream(), filePath);

        // Tạo thực thể Song
        Song song = new Song();
        song.setTitle(title != null && !title.trim().isEmpty() ? title : file.getOriginalFilename());
        song.setArtist(artist != null && !artist.trim().isEmpty() ? artist : "Unknown Artist");
        song.setFilePath(filePath.toString());
        song.setFileSize(file.getSize());
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
    public void deleteSong(Long id) {
        Song song = songRepository.findById(id).orElse(null);
        if (song != null) {
            try {
                Files.deleteIfExists(Paths.get(song.getFilePath()));
            } catch (IOException e) {
                e.printStackTrace();
            }
            songRepository.deleteById(id);
        }
    }
}
