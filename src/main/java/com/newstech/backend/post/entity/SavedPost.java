package com.newstech.backend.post.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "saved_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavedPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private com.newstech.backend.user.entity.User user;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    private java.time.LocalDateTime savedAt;

    @PrePersist
    protected void onSave() {
        savedAt = java.time.LocalDateTime.now();
    }
}
