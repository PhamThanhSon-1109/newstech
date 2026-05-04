package com.newstech.backend.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PostRequest {
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Content is required")
    private String content;
    private String excerpt;
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    private String thumbnail;
}