package com.newstech.backend.category.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String name;
    private String slug;

    @OneToMany(mappedBy = "category", cascade = CascadeType.REMOVE)
    private java.util.List<com.newstech.backend.post.entity.Post> posts;
}