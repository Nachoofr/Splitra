package com.intern.splitra.controller;

import com.intern.splitra.constant.GroupApiEndpointConstants;
import com.intern.splitra.dto.GroupDto;
import com.intern.splitra.dto.GroupMemberDto;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.model.User;
import com.intern.splitra.service.GroupService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
public class GroupController {

    GroupService groupService;

    @PostMapping(GroupApiEndpointConstants.GROUPS)
    public ResponseEntity<GroupDto> createGroup(@RequestBody GroupDto groupDto, @AuthenticationPrincipal UserPrinciple userPrinciple) {
        long userId = userPrinciple.getUser().getId();
        return groupService.createGroup(groupDto,userId);
    }

    @GetMapping(GroupApiEndpointConstants.GROUPS)
    public ResponseEntity<List<GroupDto>> getAllGroups(@AuthenticationPrincipal UserPrinciple userPrinciple) {
        long userId = userPrinciple.getUser().getId();
        return groupService.getAllGroups(userId);
    }

    @GetMapping(GroupApiEndpointConstants.GROUP_ID)
    public ResponseEntity<GroupDto> getGroupById(@PathVariable long id) {
        return groupService.getGroupById(id);
    }

    @PostMapping (GroupApiEndpointConstants.JOIN_GROUP)
    public ResponseEntity<GroupDto> joinGroup(@PathVariable String inviteToken, @AuthenticationPrincipal UserPrinciple userPrinciple) {
        long userId = userPrinciple.getUser().getId();
        return groupService.joinGroup(inviteToken, userId);
    }

    @GetMapping(GroupApiEndpointConstants.GET_INVITE_LINK)
    public ResponseEntity<String> getInviteLink(@PathVariable long id, @AuthenticationPrincipal UserPrinciple userPrinciple) {
        long userId = userPrinciple.getUser().getId();
        return groupService.getInviteLink(id, userId);
    }

    @GetMapping(GroupApiEndpointConstants.GROUP_MEMBERS)
    public ResponseEntity<Long> getNumberOfMembers(@PathVariable long id) {
        return groupService.getNumberOfMembers(id);
    }

    @GetMapping(GroupApiEndpointConstants.GROUP_ID + "/members")
    public ResponseEntity<List<GroupMemberDto>> getGroupMembers(@PathVariable long id, @AuthenticationPrincipal UserPrinciple userPrinciple) {
        long userId= userPrinciple.getUser().getId();
        return groupService.getGroupMembers(id, userId);
    }

    @DeleteMapping(GroupApiEndpointConstants.GROUP_ID + "/delete")
    public ResponseEntity<Void> deleteGroup(@PathVariable long id, @AuthenticationPrincipal UserPrinciple userPrinciple) {
        long userId = userPrinciple.getUser().getId();
        return groupService.deleteGroup(id, userId);
    }

    @DeleteMapping(GroupApiEndpointConstants.GROUP_ID + "/leave")
    public ResponseEntity<Void> leaveGroup(@PathVariable long id, @AuthenticationPrincipal UserPrinciple userPrinciple) {
        long userId = userPrinciple.getUser().getId();
        return groupService.leaveGroup(id, userId);
    }
}
