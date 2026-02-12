package com.intern.splitra.controller;

import com.intern.splitra.constant.CategoryApiEndpointConstants;
import com.intern.splitra.dto.CategoryDto;
import com.intern.splitra.service.CategoryService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
public class CategoryController {

    CategoryService categoryService;

    @PostMapping(CategoryApiEndpointConstants.GLOBAL)
    public ResponseEntity<List<CategoryDto>> createGlobalCategory() {
        return categoryService.createGlobalCategory();
    }

    @GetMapping(CategoryApiEndpointConstants.CATEGORIES)
     public ResponseEntity<List<CategoryDto>> getAllCategories() {
        return categoryService.getAllCategories();
    }
}
