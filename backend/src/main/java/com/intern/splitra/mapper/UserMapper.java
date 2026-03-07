package com.intern.splitra.mapper;

import com.intern.splitra.dto.UserDto;
import com.intern.splitra.model.User;
import org.mapstruct.*;

@Mapper(componentModel="spring")
public interface UserMapper {
    UserDto toDto(User user);
    User toEntity(UserDto userDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "qrCodes", ignore = true)
    User update(UserDto userDto, @MappingTarget User user);
}
