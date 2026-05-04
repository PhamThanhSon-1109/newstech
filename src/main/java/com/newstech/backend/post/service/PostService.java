package com.newstech.backend.post.service;

import com.newstech.backend.post.dto.PostRequest;
import com.newstech.backend.post.dto.PostResponse;
import com.newstech.backend.category.entity.Category;
import com.newstech.backend.post.entity.Post;
import com.newstech.backend.category.repository.CategoryRepository;
import com.newstech.backend.post.repository.PostRepository;
import com.newstech.backend.common.SlugUtil;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.newstech.backend.like.repository.LikeRepository;
import java.util.List;

import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final LikeRepository likeRepository;

    public PostService(PostRepository postRepository, CategoryRepository categoryRepository,
            LikeRepository likeRepository) {
        this.postRepository = postRepository;
        this.categoryRepository = categoryRepository;
        this.likeRepository = likeRepository;
    }

    // GET ALL
    public List<PostResponse> getAllPosts() {
        return postRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // CREATE POST
    public PostResponse createPost(PostRequest request, com.newstech.backend.user.entity.User author) {

        // 1. Tạo entity mới
        Post post = new Post();

        // 2. Set dữ liệu từ request
        post.setTitle(request.getTitle());
        post.setExcerpt(request.getExcerpt());
        post.setContent(request.getContent());
        post.setThumbnail(request.getThumbnail());
        post.setAuthor(author);

        // 3. Tạo slug
        post.setSlug(SlugUtil.toSlug(request.getTitle()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        post.setCategory(category);

        // 4. Save DB
        Post saved = postRepository.save(post);

        // 5. Trả về response
        return mapToResponse(saved);
    }

    // UPDATE POST
    public PostResponse updatePost(Long id, PostRequest request) {

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setTitle(request.getTitle());
        post.setExcerpt(request.getExcerpt());
        post.setContent(request.getContent());
        post.setThumbnail(request.getThumbnail());

        // update slug theo title mới
        post.setSlug(SlugUtil.toSlug(request.getTitle()));

        // update category
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            post.setCategory(category);
        }

        Post updated = postRepository.save(post);

        return mapToResponse(updated);
    }

    // DELETE POST
    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }

    // MAPPER: Entity → DTO
    private PostResponse mapToResponse(Post post) {
        PostResponse res = new PostResponse();
        res.setId(post.getId());
        res.setTitle(post.getTitle());
        res.setExcerpt(post.getExcerpt());
        res.setContent(post.getContent());
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

    public Page<PostResponse> getPostsByCategory(Long categoryId, int page, int size) {
        return postRepository.findByCategoryId(categoryId, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    public Page<PostResponse> getPostsByCategorySlug(String categorySlug, int page, int size) {
        return postRepository.findByCategorySlug(categorySlug, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    public Page<PostResponse> getPostsPaging(int page, int size) {
        Page<Post> postPage = postRepository.findAll(PageRequest.of(page, size));
        return postPage.map(this::mapToResponse);
    }

    public Page<PostResponse> getTopPosts(int page, int size) {
        Page<Post> postPage = postRepository.findAllByOrderByViewsDesc(PageRequest.of(page, size));
        return postPage.map(this::mapToResponse);
    }

    public Page<PostResponse> getTopLikedPosts(int page, int size) {
        Page<Post> postPage = postRepository.findAllByOrderByLikeCountDesc(PageRequest.of(page, size));
        return postPage.map(this::mapToResponse);
    }

    public void incrementView(Long id) {
        postRepository.findById(id).ifPresent(post -> {
            post.setViews((post.getViews() == null ? 0 : post.getViews()) + 1);
            postRepository.save(post);
        });
    }

    public Page<PostResponse> search(String keyword, int page, int size) {

        return postRepository
                .findByTitleContainingIgnoreCase(keyword, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return mapToResponse(post);
    }

    public PostResponse getPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return mapToResponse(post);
    }
}