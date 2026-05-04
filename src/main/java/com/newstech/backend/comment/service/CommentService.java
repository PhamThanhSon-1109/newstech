package com.newstech.backend.comment.service;

import com.newstech.backend.comment.dto.*;
import com.newstech.backend.comment.entity.Comment;
import com.newstech.backend.comment.repository.CommentRepository;
import com.newstech.backend.post.entity.Post;
import com.newstech.backend.post.repository.PostRepository;
import com.newstech.backend.user.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public CommentService(CommentRepository commentRepository,
            PostRepository postRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    // CREATE COMMENT
    public CommentResponse create(CommentRequest request, User user) {

        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setUser(user);
        comment.setPost(post);

        // reply
        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent not found"));
            comment.setParent(parent);
        }

        Comment saved = commentRepository.save(comment);

        return map(saved);
    }

    // GET BY POST
    public List<CommentResponse> getByPost(Long postId) {
        return commentRepository.findByPostId(postId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    private CommentResponse map(Comment c) {
        CommentResponse res = new CommentResponse();
        res.setId(c.getId());
        res.setContent(c.getContent());
        res.setUsername(c.getUser().getUsername());
        res.setParentId(c.getParent() != null ? c.getParent().getId() : null);
        res.setParentUsername(c.getParent() != null ? c.getParent().getUser().getUsername() : null);
        res.setCreatedAt(c.getCreatedAt());
        return res;
    }
}