package com.intern.splitra.service;

import com.intern.splitra.dto.GroupDto;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface GroupService {
    ResponseEntity<GroupDto> createGroup(GroupDto groupDto, long groupID);
    ResponseEntity<List<GroupDto>> getAllGroups(long userId);
    ResponseEntity<GroupDto> joinGroup(String inviteToken, long userId);
    ResponseEntity<String> getInviteLink(long groupId, long userId);

}
