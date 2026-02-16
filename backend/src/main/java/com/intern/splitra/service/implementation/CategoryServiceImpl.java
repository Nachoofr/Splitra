package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.CategoryDto;
import com.intern.splitra.mapper.CategoryMapper;
import com.intern.splitra.model.Category;
import com.intern.splitra.model.Groups;
import com.intern.splitra.repository.CategoryRepo;
import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.service.CategoryService;
import lombok.AllArgsConstructor;
import org.apache.catalina.Group;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class CategoryServiceImpl implements CategoryService {

    CategoryMapper categoryMapper;
    CategoryRepo categoryRepo;
    GroupRepo groupRepo;

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


    public ResponseEntity<CategoryDto> createCustomCategory(Long groupId, CategoryDto categoryDto, Long userId) {
        Groups group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getMembers().stream().anyMatch(member -> member.getId() == userId)) {
            throw new RuntimeException("User is not a member of the group");
        }

        Optional<Category> existingCategories = categoryRepo.findByNameAndGroupId(categoryDto.getName(), groupId);
        Optional<Category> globalCategories = categoryRepo.findByNameAndGroupIsNull(categoryDto.getName());

        if (existingCategories.isPresent() || globalCategories.isPresent()) {
            throw new RuntimeException("Category with the same name already exists");
        }

        var category = categoryMapper.toEntity(categoryDto);
        category.setGroup(group);
        categoryRepo.save(category);

        return new ResponseEntity<>(categoryMapper.toDto(category), HttpStatus.OK);
    }

    public ResponseEntity<List<CategoryDto>> getCategoriesByGroupId(Long groupId) {
        List<CategoryDto> groupCategories = categoryRepo.findAllByGroupId(groupId).stream()
                .map(categoryMapper ::toDto)
                .toList();

        List<CategoryDto> globalCategories = categoryRepo.findByGroupIsNull().stream()
                .map(categoryMapper::toDto)
                .toList();


        List<CategoryDto> allCategories = new ArrayList<>();
        allCategories.addAll(globalCategories);
        allCategories.addAll(groupCategories);

        return new ResponseEntity<>(allCategories, HttpStatus.OK);
    }

}
