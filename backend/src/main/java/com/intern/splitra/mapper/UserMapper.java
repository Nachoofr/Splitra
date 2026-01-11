package com.intern.splitra.mapper;

import com.intern.splitra.dto.UserDto;
import com.intern.splitra.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel="spring")
public interface UserMapper {
    UserDto toDto(User user);
    User toEntity(UserDto userDto);
    User update(UserDto userDto, @MappingTarget User user);
}
