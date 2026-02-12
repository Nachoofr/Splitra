package com.intern.splitra.service;

import com.intern.splitra.dto.CategoryDto;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface CategoryService {
    ResponseEntity<List<CategoryDto>> createGlobalCategory();
    ResponseEntity<List<CategoryDto>> getAllCategories();

}
