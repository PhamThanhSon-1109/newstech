package com.newstech.backend.comment.entity;

import com.newstech.backend.post.entity.Post;
import com.newstech.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    // user comment
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // post
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    // reply comment
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Comment parent;

    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }
}