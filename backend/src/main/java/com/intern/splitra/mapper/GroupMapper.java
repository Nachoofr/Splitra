package com.intern.splitra.mapper;

import com.intern.splitra.dto.GroupDto;
import com.intern.splitra.model.Groups;
import org.apache.catalina.Group;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface GroupMapper {
    GroupDto toDto(Groups group);
    Groups toEntity(GroupDto groupDto);
    Group update(GroupDto groupDto, @MappingTarget Group group);
}
