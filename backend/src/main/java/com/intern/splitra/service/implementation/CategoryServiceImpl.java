package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.CategoryDto;
import com.intern.splitra.mapper.CategoryMapper;
import com.intern.splitra.model.Category;
import com.intern.splitra.repository.CategoryRepo;
import com.intern.splitra.service.CategoryService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@AllArgsConstructor
@Service
public class CategoryServiceImpl implements CategoryService {

    CategoryMapper categoryMapper;
    CategoryRepo categoryRepo;

    public ResponseEntity<List<CategoryDto>> createGlobalCategory() {
        List<Category> savedCategories = new ArrayList<>();
        List<String> categories = Arrays.asList(
                "Food", "Drinks", "Transportation", "Entertainment",
                "Utilities", "Healthcare", "Shopping",
                "Travel", "Education", "Housing", "Other"
        );
        if (categoryRepo.findByGroupIsNull().size() >= categories.size()) {
            System.out.println("Global categories already exist"+categoryRepo.findByGroupIsNull().size());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        categories.forEach(name -> {
            Category category = new Category();
            category.setName(name);
            category.setGroup(null);
            savedCategories.add(categoryRepo.save(category));
        });

        List<CategoryDto> categoriesDto = savedCategories.stream()
                .map(categoryMapper::toDto)
                .toList();

        return new ResponseEntity<>(categoriesDto, HttpStatus.OK);
    }


    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        var categories = categoryRepo.findAll().stream()
                .map(categoryMapper::toDto)
                .toList();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

}
