package com.newstech.backend.post.repository;

import com.newstech.backend.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Post> findByCategorySlug(String categorySlug, Pageable pageable);

    Page<Post> findAllByOrderByViewsDesc(Pageable pageable);

    java.util.Optional<Post> findBySlug(String slug);

    Page<Post> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Post p SET p.likeCount = (SELECT CAST(COUNT(l) AS int) FROM Like l WHERE l.post = p)")
    void syncLikeCounts();

    Page<Post> findAllByOrderByLikeCountDesc(Pageable pageable);
}