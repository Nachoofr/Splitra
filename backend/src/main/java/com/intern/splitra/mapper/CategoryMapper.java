package com.intern.splitra.mapper;

import com.intern.splitra.dto.CategoryDto;
import com.intern.splitra.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(source="group.id", target="groupId")
    CategoryDto toDto(Category category);

    @Mapping(source="groupId", target="group.id")
    Category toEntity(CategoryDto categoryDto);

    Category update(CategoryDto categoryDto, @MappingTarget Category category);
}
