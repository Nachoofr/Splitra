package com.intern.splitra.controller;

import com.intern.splitra.constant.CategoryApiEndpointConstants;
import com.intern.splitra.dto.CategoryDto;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.service.CategoryService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping(CategoryApiEndpointConstants.CATEGORIES)
    public ResponseEntity<CategoryDto> createCustomCategory(@RequestBody CategoryDto categoryDto, @AuthenticationPrincipal UserPrinciple userPrinciple){
        Long userId = userPrinciple.getUser().getId();
        Long groupId = categoryDto.getGroupId();
        return categoryService.createCustomCategory(groupId, categoryDto, userId);
    }

    @GetMapping(CategoryApiEndpointConstants.GROUP_CATEGORIES)
    public ResponseEntity<List<CategoryDto>> getCategoriesByGroupId(@PathVariable Long groupId) {
        return categoryService.getCategoriesByGroupId(groupId);
    }
}
