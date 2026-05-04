package com.newstech.backend.post.controller;

import com.newstech.backend.post.dto.PostRequest;
import com.newstech.backend.post.dto.PostResponse;
import com.newstech.backend.post.service.PostService;
import com.newstech.backend.user.entity.User;
import com.newstech.backend.user.entity.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;
import com.newstech.backend.common.ApiResponse;
import org.springframework.web.multipart.MultipartFile;
import com.newstech.backend.common.FileService;

@RestController
@RequestMapping("/api/v1/posts")
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;
    private final FileService fileService;

    public PostController(PostService postService, FileService fileService) {
        this.postService = postService;
        this.fileService = fileService;
    }

    // GET ALL
    @GetMapping
    public ApiResponse<?> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(defaultValue = "false") boolean top,
            @RequestParam(defaultValue = "false") boolean topLiked) {

        // search
        if (keyword != null) {
            return new ApiResponse<>(
                    true,
                    postService.search(keyword, page, size),
                    "Search success");
        }

        // filter category by slug
        if (categorySlug != null) {
            return new ApiResponse<>(
                    true,
                    postService.getPostsByCategorySlug(categorySlug, page, size),
                    "Filter by category slug success");
        }

        // filter category by id
        if (categoryId != null) {
            return new ApiResponse<>(
                    true,
                    postService.getPostsByCategory(categoryId, page, size),
                    "Filter by category success");
        }

        // top posts (by views)
        if (top) {
            return new ApiResponse<>(
                    true,
                    postService.getTopPosts(page, size),
                    "Get top posts success");
        }

        // top liked posts
        if (topLiked) {
            return new ApiResponse<>(
                    true,
                    postService.getTopLikedPosts(page, size),
                    "Get top liked posts success");
        }

        // default paging
        return new ApiResponse<>(
                true,
                postService.getPostsPaging(page, size),
                "Get posts success");
    }

    @PostMapping("/{id}/view")
    public ApiResponse<String> incrementView(@PathVariable Long id) {
        postService.incrementView(id);
        return new ApiResponse<>(true, null, "View incremented");
    }

    @GetMapping("/{id}")
    public ApiResponse<PostResponse> getPostById(@PathVariable Long id) {
        return new ApiResponse<>(true, postService.getPostById(id), "Success");
    }

    @GetMapping("/slug/{slug}")
    public ApiResponse<PostResponse> getPostBySlug(@PathVariable String slug) {
        return new ApiResponse<>(true, postService.getPostBySlug(slug), "Success");
    }

    // CREATE
    @PostMapping
    public ApiResponse<PostResponse> createPost(
            @Valid @RequestBody PostRequest request,
            HttpServletRequest httpRequest) {

        User user = (User) httpRequest.getAttribute("user");

        if (user == null || user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Forbidden - Admin only");
        }

        return new ApiResponse<>(
                true,
                postService.createPost(request, user),
                "Created");
    }

    // UPDATE
    @PutMapping("/{id}")
    public ApiResponse<PostResponse> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request,
            HttpServletRequest httpRequest) {

        User user = (User) httpRequest.getAttribute("user");

        if (user == null || user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Forbidden - Admin only");
        }

        return new ApiResponse<>(
                true,
                postService.updatePost(id, request),
                "Updated");
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ApiResponse<String> deletePost(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        User user = (User) httpRequest.getAttribute("user");

        if (user == null || user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Forbidden - Admin only");
        }

        postService.deletePost(id);

        return new ApiResponse<>(true, null, "Deleted");
    }

    @PostMapping("/upload")
    public ApiResponse<String> upload(@RequestParam("file") MultipartFile file) {

        String url = fileService.upload(file);

        return new ApiResponse<>(true, url, "Upload success");
    }
}