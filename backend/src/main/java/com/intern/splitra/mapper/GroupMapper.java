package com.intern.splitra.mapper;

import com.intern.splitra.dto.GroupDto;
import com.intern.splitra.model.Groups;
import com.intern.splitra.util.MapperUtil;
import org.mapstruct.*;

@Mapper(componentModel = "spring",  uses = {MapperUtil.class})
public interface GroupMapper {
    @Mapping(target = "createdBy", source = "createdBy.id")
    GroupDto toDto(Groups group);

    @Mapping(target = "createdBy.id", source = "createdBy")
    @Mapping(target = "customCategories", ignore = true)
    Groups toEntity(GroupDto groupDto);
    
    @Mapping(target = "createdBy.id", source = "createdBy")
    @Mapping(target = "customCategories", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "activities", ignore = true)
    Groups update(GroupDto groupDto, @MappingTarget Groups group);
}
