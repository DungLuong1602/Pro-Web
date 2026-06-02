package com.localspotify.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.localspotify.dto.ApiResponse;
import com.localspotify.entity.Playlist;
import com.localspotify.service.PlaylistService;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Playlist>> createPlaylist(@RequestParam String name, @RequestParam Long userId) {
        try {
            Playlist playlist = playlistService.createPlaylist(name, userId);
            if (playlist.getUser() != null) {
                playlist.getUser().setPassword(null);
            }
            return ResponseEntity.ok(new ApiResponse<>(200, "Tạo playlist thành công!", playlist));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Playlist>>> getPlaylistsByUser(@PathVariable Long userId) {
        List<Playlist> playlists = playlistService.getPlaylistsByUser(userId);
        playlists.forEach(p -> {
            if(p.getUser() != null) p.getUser().setPassword(null);
        });
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy danh sách thành công!", playlists));
    }

    @PostMapping("/add-song")
    public ResponseEntity<ApiResponse<Playlist>> addSongToPlaylist(@RequestParam Long playlistId, @RequestParam Long songId) {
        try {
            Playlist playlist = playlistService.addSongToPlaylist(playlistId, songId);
            if (playlist.getUser() != null) {
                playlist.getUser().setPassword(null);
            }
            return ResponseEntity.ok(new ApiResponse<>(200, "Thêm nhạc thành công!", playlist));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}   