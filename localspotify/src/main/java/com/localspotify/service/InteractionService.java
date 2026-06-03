package com.localspotify.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.localspotify.entity.Comment;
import com.localspotify.entity.Like;
import com.localspotify.entity.Song;
import com.localspotify.entity.User;
import com.localspotify.repository.CommentRepository;
import com.localspotify.repository.LikeRepository;
import com.localspotify.repository.SongRepository;
import com.localspotify.repository.UserRepository;

@Service
public class InteractionService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SongRepository songRepository;


    public Map<String, Object> toggleLike(Long userId, Long songId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User không hợp lệ"));
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new Exception("Bài hát không hợp lệ"));

        Like.LikeId id = new Like.LikeId(userId, songId);
        boolean exists = likeRepository.existsById(id);

        if (exists) {
            likeRepository.deleteById(id);
            return Map.of("liked", false, "count", likeRepository.countBySongId(songId));
        } else {
            Like like = new Like(user, song);
            likeRepository.save(like);
            return Map.of("liked", true, "count", likeRepository.countBySongId(songId));
        }
    }

    public long getLikeCount(Long songId) {
        return likeRepository.countBySongId(songId);
    }

    public Comment addComment(Long userId, Long songId, String content) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User không hợp lệ"));
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new Exception("Bài hát không hợp lệ"));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setSong(song);
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsBySong(Long songId) {
        return commentRepository.findBySongIdOrderByCreatedAtDesc(songId);
    }
}