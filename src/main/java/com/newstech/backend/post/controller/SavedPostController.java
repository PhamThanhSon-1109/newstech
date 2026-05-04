package com.newstech.backend.post.controller;

import com.newstech.backend.common.ApiResponse;
import com.newstech.backend.post.dto.PostResponse;
import com.newstech.backend.post.service.SavedPostService;
import com.newstech.backend.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/saved-posts")
@CrossOrigin(origins = "*")
public class SavedPostController {

    private final SavedPostService savedPostService;

    public SavedPostController(SavedPostService savedPostService) {
        this.savedPostService = savedPostService;
    }

    @PostMapping("/{postId}")
    public ApiResponse<Boolean> toggleSave(@PathVariable Long postId, HttpServletRequest request) {
        User user = (User) request.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Unauthorized");
        }
        boolean isSaved = savedPostService.toggleSave(postId, user);
        return new ApiResponse<>(true, isSaved, isSaved ? "Saved successfully" : "Unsaved successfully");
    }

    @GetMapping("/check/{postId}")
    public ApiResponse<Boolean> checkSaved(@PathVariable Long postId, HttpServletRequest request) {
        User user = (User) request.getAttribute("user");
        if (user == null) {
            return new ApiResponse<>(true, false, "Not saved");
        }
        return new ApiResponse<>(true, savedPostService.isSaved(postId, user.getId()), "Success");
    }

    @GetMapping
    public ApiResponse<List<PostResponse>> getMySavedPosts(HttpServletRequest request) {
        User user = (User) request.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Unauthorized");
        }
        return new ApiResponse<>(true, savedPostService.getSavedPosts(user.getId()), "Success");
    }
}
