package com.intern.splitra.repository;

import com.intern.splitra.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepo extends JpaRepository<Category, Long> {
    List<Category> findByGroupIsNull();
    Optional<Category> findByNameAndGroupId(String name, Long groupId);
    Optional<Category> findByNameAndGroupIsNull(String name);
    List<Category> findAllByGroupId(Long groupId);
}
