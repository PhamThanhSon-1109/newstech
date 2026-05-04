package com.newstech.backend.config;

import com.newstech.backend.security.JwtFilter;
import com.newstech.backend.security.JwtUtil;
import com.newstech.backend.user.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class SecurityConfig {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public SecurityConfig(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // SECURITY CONFIG CHÍNH
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(org.springframework.security.config.Customizer.withDefaults()) // Kích hoạt CORS trên Spring
                                                                                     // Security
                .csrf(csrf -> csrf.disable()) // tắt CSRF (API dùng JWT)

                .authorizeHttpRequests(auth -> auth

                        // PUBLIC GET APIs (Cho phép xem dữ liệu không cần login)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/posts/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/posts/*/view").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/categories/**").permitAll()

                        // AUTH API
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // CÁC API CÒN LẠI PHẢI ĐĂNG NHẬP
                        .requestMatchers("/api/v1/**").authenticated()

                        // UPLOADS & STATIC FILES
                        .requestMatchers("/uploads/**").permitAll()
                        .anyRequest().permitAll())

                // thêm JWT filter
                .addFilterBefore(
                        new JwtFilter(userRepository, jwtUtil),
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}