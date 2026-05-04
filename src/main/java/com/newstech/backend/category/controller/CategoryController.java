package com.newstech.backend.category.controller;

import com.newstech.backend.category.dto.*;
import com.newstech.backend.category.service.CategoryService;
import com.newstech.backend.common.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public ApiResponse<CategoryResponse> create(@RequestBody CategoryRequest req) {
        return new ApiResponse<>(true, service.create(req), "Created");
    }

    // GET ALL
    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAll() {
        return new ApiResponse<>(true, service.getAll(), "Success");
    }

    // UPDATE
    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> update(
            @PathVariable Long id,
            @RequestBody CategoryRequest req) {

        return new ApiResponse<>(true, service.update(id, req), "Updated");
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {

        service.delete(id);

        return new ApiResponse<>(true, null, "Deleted");
    }
}