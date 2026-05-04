package com.newstech.backend.common;

import com.newstech.backend.post.repository.PostRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class LikedSyncRunner implements CommandLineRunner {

    private final PostRepository postRepository;

    public LikedSyncRunner(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println(">>> Syncing post like counts...");
        postRepository.syncLikeCounts();
        System.out.println(">>> Syncing completed.");
    }
}
