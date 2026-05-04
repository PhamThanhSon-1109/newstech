package com.newstech.backend.comment.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private Long postId;
    private String content;
    private Long parentId; // reply
}