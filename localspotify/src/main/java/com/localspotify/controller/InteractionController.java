package com.localspotify.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.localspotify.dto.ApiResponse;
import com.localspotify.entity.Comment;
import com.localspotify.service.InteractionService;

@RestController
@RequestMapping("/api/interactions")
public class InteractionController {

    @Autowired
    private InteractionService interactionService;

    @PostMapping("/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(@RequestParam Long userId, @RequestParam Long songId) {
        try {
            Map<String, Object> result = interactionService.toggleLike(userId, songId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Thực hiện tương tác Like thành công!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @PostMapping("/comment")
    public ResponseEntity<ApiResponse<Comment>> addComment(@RequestParam Long userId, @RequestParam Long songId, @RequestParam String content) {
        try {
            Comment comment = interactionService.addComment(userId, songId, content);
            comment.getUser().setPassword(null);
            return ResponseEntity.ok(new ApiResponse<>(200, "Đăng bình luận thành công!", comment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping("/comments/{songId}")
    public ResponseEntity<ApiResponse<List<Comment>>> getComments(@PathVariable Long songId) {
        List<Comment> comments = interactionService.getCommentsBySong(songId);
        comments.forEach(c -> c.getUser().setPassword(null));
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy danh sách bình luận thành công!", comments));
    }
}