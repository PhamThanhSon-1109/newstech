package com.newstech.backend.post.entity;

import com.newstech.backend.category.entity.Category;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String title;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String excerpt;

    @Lob
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String content;

    private String slug;

    private Long views = 0L;
    private Integer likeCount = 0;
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String thumbnail;

    private java.time.LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private com.newstech.backend.user.entity.User author;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE)
    private java.util.List<com.newstech.backend.comment.entity.Comment> comments;

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE)
    private java.util.List<com.newstech.backend.like.entity.Like> likes;

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE)
    private java.util.List<com.newstech.backend.post.entity.SavedPost> savedPosts;
}