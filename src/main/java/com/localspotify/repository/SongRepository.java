package com.localspotify.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.localspotify.entity.Song;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
    List<Song> findByTitleContainingIgnoreCase(String title);
    List<Song> findByArtistContainingIgnoreCase(String artist);
    boolean existsByTitleIgnoreCaseAndArtistIgnoreCase(String title, String artist);
    List<Song> findByIsPublicTrue();
    List<Song> findByUploadedByIdAndIsPublicTrue(Long userId);
    List<Song> findAll();
}
