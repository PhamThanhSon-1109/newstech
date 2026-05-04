package com.newstech.backend.category.service;

import com.newstech.backend.category.dto.*;
import com.newstech.backend.category.entity.Category;
import com.newstech.backend.category.repository.CategoryRepository;
import com.newstech.backend.common.SlugUtil;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    // CREATE
    public CategoryResponse create(CategoryRequest request) {
        Category c = new Category();
        c.setName(request.getName());
        c.setSlug(SlugUtil.toSlug(request.getName()));

        return map(repository.save(c));
    }

    // GET ALL
    public List<CategoryResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    // UPDATE
    public CategoryResponse update(Long id, CategoryRequest request) {

        Category c = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        c.setName(request.getName());
        c.setSlug(SlugUtil.toSlug(request.getName()));

        return map(repository.save(c));
    }

    // DELETE
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private CategoryResponse map(Category c) {
        CategoryResponse res = new CategoryResponse();
        res.setId(c.getId());
        res.setName(c.getName());
        res.setSlug(c.getSlug());
        return res;
    }
}