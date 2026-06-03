package com.localspotify.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.localspotify.entity.Like;

@Repository
public interface LikeRepository extends JpaRepository<Like, Like.LikeId> {
    long countBySongId(Long songId);
    boolean existsById(Like.LikeId id);
    java.util.List<Like> findByIdUserId(Long userId);
}