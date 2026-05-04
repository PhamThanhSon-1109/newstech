package com.newstech.backend.post.dto;

import lombok.Data;

@Data
public class PostResponse {

    private Long id;
    private String title;
    private String excerpt;
    private String content;
    private String slug;
    private Long views;
    private String thumbnail;
    private String categoryName;
    private java.time.LocalDateTime createdAt;
    private String authorName;
    private String authorAvatar;
    private Integer likeCount;
}
