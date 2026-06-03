package com.localspotify.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.localspotify.entity.Playlist;
import com.localspotify.entity.Song;
import com.localspotify.entity.User;
import com.localspotify.repository.PlaylistRepository;
import com.localspotify.repository.SongRepository;
import com.localspotify.repository.UserRepository;

@Service
public class PlaylistService {

    @Autowired
    private PlaylistRepository PlaylistRepository;

    @Autowired
    private UserRepository UserRepository;

    @Autowired
    private SongRepository SongRepository;

    public Playlist createPlaylist(String name, Long userId) throws Exception {
        User user = UserRepository.findById(userId)
                .orElseThrow(() -> new Exception("Không tìm thấy người dùng!"));
        Playlist playlist = new Playlist();
        playlist.setName(name);
        playlist.setUser(user);
        return PlaylistRepository.save(playlist);
    }

    public List<Playlist> getPlaylistsByUser(Long userId) {
        return PlaylistRepository.findByUserId(userId);
    }

    public Playlist addSongToPlaylist(Long playlistId, Long songId) throws Exception {
        Playlist playlist = PlaylistRepository.findById(playlistId)
                .orElseThrow(() -> new Exception("Không tìm thấy Playlist!"));
        Song song = SongRepository.findById(songId)
                .orElseThrow(() -> new Exception("Không tìm thấy bài hát!"));
        
        if (!playlist.getSongs().contains(song)) {
            playlist.getSongs().add(song);
        }
        return PlaylistRepository.save(playlist);
    }
}