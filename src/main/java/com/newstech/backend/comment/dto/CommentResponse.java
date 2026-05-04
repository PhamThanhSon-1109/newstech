package com.newstech.backend.comment.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentResponse {
    private Long id;
    private String content;
    private String username;
    private Long parentId;
    private String parentUsername;
    private LocalDateTime createdAt;
}