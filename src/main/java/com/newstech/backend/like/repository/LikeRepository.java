package com.newstech.backend.like.repository;

import com.newstech.backend.like.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {

    // check đã like chưa
    Like findByUserIdAndPostId(Long userId, Long postId);

    // lấy danh sách đã like
    java.util.List<Like> findByUserIdOrderByIdDesc(Long userId);

    long countByPostId(Long postId);
}