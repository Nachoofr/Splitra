package com.intern.splitra.service;

import com.intern.splitra.dto.GroupDto;
import org.springframework.http.ResponseEntity;

public interface GroupService {
    ResponseEntity<GroupDto> createGroup(GroupDto groupDto, long groupID);
}
