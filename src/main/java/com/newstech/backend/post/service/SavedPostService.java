package com.newstech.backend.post.service;

import com.newstech.backend.post.entity.Post;
import com.newstech.backend.post.entity.SavedPost;
import com.newstech.backend.post.repository.PostRepository;
import com.newstech.backend.post.repository.SavedPostRepository;
import com.newstech.backend.user.entity.User;
import com.newstech.backend.post.dto.PostResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SavedPostService {

    private final SavedPostRepository savedPostRepository;
    private final PostRepository postRepository;

    public SavedPostService(SavedPostRepository savedPostRepository, PostRepository postRepository) {
        this.savedPostRepository = savedPostRepository;
        this.postRepository = postRepository;
    }

    public boolean toggleSave(Long postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Optional<SavedPost> existing = savedPostRepository.findByUserIdAndPostId(user.getId(), postId);
        
        if (existing.isPresent()) {
            savedPostRepository.delete(existing.get());
            return false; // un-saved
        } else {
            SavedPost savedPost = new SavedPost();
            savedPost.setUser(user);
            savedPost.setPost(post);
            savedPostRepository.save(savedPost);
            return true; // saved
        }
    }

    public boolean isSaved(Long postId, Long userId) {
        return savedPostRepository.findByUserIdAndPostId(userId, postId).isPresent();
    }

    public List<PostResponse> getSavedPosts(Long userId) {
        return savedPostRepository.findByUserIdOrderBySavedAtDesc(userId)
                .stream()
                .map(sp -> mapToResponse(sp.getPost()))
                .collect(Collectors.toList());
    }

    private PostResponse mapToResponse(Post post) {
        PostResponse res = new PostResponse();
        res.setId(post.getId());
        res.setTitle(post.getTitle());
        res.setExcerpt(post.getExcerpt());
        res.setSlug(post.getSlug());
        res.setViews(post.getViews());
        res.setThumbnail(post.getThumbnail());
        res.setCreatedAt(post.getCreatedAt());

        if (post.getCategory() != null) {
            res.setCategoryName(post.getCategory().getName());
        }

        if (post.getAuthor() != null) {
            res.setAuthorName(post.getAuthor().getFullName() != null ? post.getAuthor().getFullName()
                    : post.getAuthor().getUsername());
            res.setAuthorAvatar(post.getAuthor().getAvatar());
        }
        return res;
    }
}
