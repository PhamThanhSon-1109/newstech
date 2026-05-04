package com.newstech.backend.like.service;

import com.newstech.backend.like.entity.Like;
import com.newstech.backend.like.repository.LikeRepository;
import com.newstech.backend.post.entity.Post;
import com.newstech.backend.post.repository.PostRepository;
import com.newstech.backend.user.entity.User;
import org.springframework.stereotype.Service;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;

    public LikeService(LikeRepository likeRepository,
            PostRepository postRepository) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
    }

    // TOGGLE LIKE
    @org.springframework.transaction.annotation.Transactional
    public String toggleLike(Long postId, User user) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // 1. check đã like chưa
        Like existing = likeRepository
                .findByUserIdAndPostId(user.getId(), postId);

        // 2. nếu đã like → unlike
        if (existing != null) {
            likeRepository.delete(existing);
            post.setLikeCount(Math.max(0, (post.getLikeCount() == null ? 0 : post.getLikeCount()) - 1));
            postRepository.save(post);
            return "Unliked";
        }

        // 3. chưa like → tạo mới
        Like like = new Like();
        like.setUser(user);
        like.setPost(post);

        likeRepository.save(like);

        post.setLikeCount((post.getLikeCount() == null ? 0 : post.getLikeCount()) + 1);
        postRepository.save(post);

        return "Liked";
    }

    public boolean isLiked(Long postId, Long userId) {
        return likeRepository.findByUserIdAndPostId(userId, postId) != null;
    }

    public java.util.List<com.newstech.backend.post.dto.PostResponse> getLikedPosts(Long userId) {
        return likeRepository.findByUserIdOrderByIdDesc(userId)
                .stream()
                .map(like -> mapToResponse(like.getPost()))
                .collect(java.util.stream.Collectors.toList());
    }

    private com.newstech.backend.post.dto.PostResponse mapToResponse(Post post) {
        com.newstech.backend.post.dto.PostResponse res = new com.newstech.backend.post.dto.PostResponse();
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

        res.setLikeCount(post.getLikeCount() != null ? post.getLikeCount() : 0);

        return res;
    }
}