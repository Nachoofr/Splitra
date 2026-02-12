package com.intern.splitra.service;

import com.intern.splitra.dto.CategoryDto;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface CategoryService {
    ResponseEntity<List<CategoryDto>> createGlobalCategory();
    ResponseEntity<List<CategoryDto>> getAllCategories();
    ResponseEntity<CategoryDto> createCustomCategory(Long groupId, CategoryDto categoryDto, Long userId);
    ResponseEntity<List<CategoryDto>> getCategoriesByGroupId(Long groupId);

}
