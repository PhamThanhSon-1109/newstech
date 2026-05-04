package com.newstech.backend.user.dto;

import com.newstech.backend.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String avatar;
    private String phone;
    private String address;
    private String dateOfBirth; // as String for simpler JSON handling or LocalDate
    private String gender;
    private Role role;
}
