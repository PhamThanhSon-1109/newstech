package com.newstech.backend.like.controller;

import com.newstech.backend.like.service.LikeService;
import com.newstech.backend.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import com.newstech.backend.common.ApiResponse;
import com.newstech.backend.post.dto.PostResponse;

@RestController
@RequestMapping("/api/v1/likes")
@CrossOrigin(origins = "*")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    // API: like/unlike
    @PostMapping("/{postId}")
    public ApiResponse<String> like(
            @PathVariable Long postId,
            HttpServletRequest request) {

        User user = (User) request.getAttribute("user");

        if (user == null) {
            throw new RuntimeException("Unauthorized");
        }

        String result = likeService.toggleLike(postId, user);
        return new ApiResponse<>(true, result, "Success");
    }

    @GetMapping("/check/{postId}")
    public ApiResponse<Boolean> checkLiked(@PathVariable Long postId, HttpServletRequest request) {
        User user = (User) request.getAttribute("user");
        if (user == null) {
            return new ApiResponse<>(true, false, "Not liked");
        }
        return new ApiResponse<>(true, likeService.isLiked(postId, user.getId()), "Success");
    }

    @GetMapping
    public ApiResponse<java.util.List<PostResponse>> getMyLikedPosts(HttpServletRequest request) {
        User user = (User) request.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Unauthorized");
        }
        return new ApiResponse<>(true, likeService.getLikedPosts(user.getId()), "Success");
    }
}