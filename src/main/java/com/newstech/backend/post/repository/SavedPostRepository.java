package com.newstech.backend.post.repository;

import com.newstech.backend.post.entity.SavedPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {
    
    List<SavedPost> findByUserIdOrderBySavedAtDesc(Long userId);

    Optional<SavedPost> findByUserIdAndPostId(Long userId, Long postId);
}
