package com.intern.splitra.service;

import com.intern.splitra.dto.GroupDto;
import com.intern.splitra.dto.GroupMemberDto;
import com.intern.splitra.model.User;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface GroupService {
    ResponseEntity<GroupDto> createGroup(GroupDto groupDto, long groupID);
    ResponseEntity<List<GroupDto>> getAllGroups(long userId);
    ResponseEntity<GroupDto> getGroupById(long groupId);
    ResponseEntity<GroupDto> joinGroup(String inviteToken, long userId);
    ResponseEntity<String> getInviteLink(long groupId, long userId);
    ResponseEntity<Long> getNumberOfMembers(long groupId);
    ResponseEntity<List<GroupMemberDto>> getGroupMembers(long groupId, long userId);
    ResponseEntity<Void> deleteGroup(long groupId, long userId);
    ResponseEntity<Void> leaveGroup(long groupId, long userId);
}
