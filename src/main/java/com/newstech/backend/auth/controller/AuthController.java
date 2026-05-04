package com.newstech.backend.auth.controller;

import com.newstech.backend.auth.dto.LoginRequest;
import com.newstech.backend.auth.dto.RegisterRequest;
import com.newstech.backend.auth.service.AuthService;
import org.springframework.web.bind.annotation.*;

import com.newstech.backend.common.ApiResponse;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<String> register(@RequestBody RegisterRequest request) {
        return new ApiResponse<>(true, authService.register(request), "Register success");
    }

    @PostMapping("/login")
    public ApiResponse<String> login(@RequestBody LoginRequest request) {
        return new ApiResponse<>(true, authService.login(request), "Login success");
    }

}