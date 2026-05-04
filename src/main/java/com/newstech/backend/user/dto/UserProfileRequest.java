package com.newstech.backend.user.dto;

import lombok.Data;

@Data
public class UserProfileRequest {
    private String fullName;
    private String email;
    private String avatar;
    private String phone;
    private String address;
    private String dateOfBirth; // yyyy-MM-dd
    private String gender;
}
