package com.localspotify.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "likes")
public class Like {

    @EmbeddedId
    private LikeId id = new LikeId();

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id")
    private Song song;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public Like() {}

    public Like(User user, Song song) {
        this.user = user;
        this.song = song;
        this.id = new LikeId(user.getId(), song.getId());
    }

    public LikeId getId() { return id; }
    public void setId(LikeId id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Song getSong() { return song; }
    public void setSong(Song song) { this.song = song; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    @Embeddable
    public static class LikeId implements Serializable {
        private Long userId;
        private Long songId;

        public LikeId() {}
        public LikeId(Long userId, Long songId) {
            this.userId = userId;
            this.songId = songId;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getSongId() { return songId; }
        public void setSongId(Long songId) { this.songId = songId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            LikeId likeId = (LikeId) o;
            return Objects.equals(userId, likeId.userId) && Objects.equals(songId, likeId.songId);
        }
        @Override
        public int hashCode() { return Objects.hash(userId, songId); }
    }
}