package com.intern.splitra.util;

import com.intern.splitra.enums.SplitMethod;
import enums.GroupStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface MapperUtil {
    @Named("mapSplitMethod")
    default SplitMethod mapSplitMethod(String status) {
        if (status == null) return null;
        return SplitMethod.valueOf(status.toUpperCase().trim());
    }
}
