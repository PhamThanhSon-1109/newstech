package com.newstech.backend.comment.controller;

import com.newstech.backend.comment.dto.*;
import com.newstech.backend.comment.service.CommentService;
import com.newstech.backend.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {

    private final CommentService service;

    public CommentController(CommentService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public CommentResponse create(
            @RequestBody CommentRequest request,
            HttpServletRequest httpRequest) {

        User user = (User) httpRequest.getAttribute("user");

        if (user == null) {
            throw new RuntimeException("Unauthorized");
        }

        return service.create(request, user);
    }

    // GET
    @GetMapping("/post/{postId}")
    public List<CommentResponse> get(@PathVariable Long postId) {
        return service.getByPost(postId);
    }
}