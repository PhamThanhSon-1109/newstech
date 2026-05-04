package com.newstech.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.newstech.backend.user.entity.Role;
import com.newstech.backend.user.entity.User;
import com.newstech.backend.user.repository.UserRepository;
import com.newstech.backend.category.entity.Category;
import com.newstech.backend.category.repository.CategoryRepository;
import com.newstech.backend.post.repository.PostRepository;
import com.newstech.backend.common.SlugUtil;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner init(UserRepository userRepository,
            CategoryRepository categoryRepository,
            PostRepository postRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {

            if (userRepository.findByUsername("admin").isEmpty()) {

                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("123456"));
                admin.setRole(Role.ADMIN);
                admin.setFullName("Quản trị viên");
                admin.setAvatar("https://picsum.photos/id/64/40/40");

                userRepository.save(admin);

                System.out.println(" Admin created");
            }

            // Create sample categories
            if (categoryRepository.count() == 0) {
                String[] catNames = { "Smartphone", "AI", "Laptop", "Blockchain", "Gadget", "Hardware" };
                for (String name : catNames) {
                    Category cat = new Category();
                    cat.setName(name);
                    cat.setSlug(SlugUtil.toSlug(name));
                    categoryRepository.save(cat);
                }
                System.out.println(" Categories initialized");
            }

            // Sample posts creation removed to only use existing database data
        };
    }
}
