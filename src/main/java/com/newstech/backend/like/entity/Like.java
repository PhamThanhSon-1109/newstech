package com.newstech.backend.like.entity;

import com.newstech.backend.post.entity.Post;
import com.newstech.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "likes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // user nào like
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // like bài nào
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;
}