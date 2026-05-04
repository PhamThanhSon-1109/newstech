package com.newstech.backend.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;
    private String password;
    private String email;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String fullName;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String avatar;
    private String phone;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String address;

    private java.time.LocalDate dateOfBirth;
    private String gender;

    @Enumerated(EnumType.STRING)
    private Role role;
}