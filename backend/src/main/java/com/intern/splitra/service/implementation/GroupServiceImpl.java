package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.GroupDto;
import com.intern.splitra.dto.GroupMemberDto;
import com.intern.splitra.mapper.GroupMapper;
import com.intern.splitra.model.Groups;
import com.intern.splitra.model.User;
import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.GroupService;
import enums.GroupStatus;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@AllArgsConstructor
@Service
public class GroupServiceImpl implements GroupService {
    GroupMapper groupMapper;
    GroupRepo groupRepo;
    UserRepo userRepo;

    public ResponseEntity<GroupDto> createGroup(GroupDto groupDto, long userID) {
        User user = userRepo.findById(userID)
                .orElseThrow(() -> new RuntimeException("User not found"));
        var groups = groupMapper.toEntity(groupDto);
        groups.setCreatedBy(user);
        groups.setStatus(GroupStatus.CREATED);
        groups.getMembers().add(user);
        groupRepo.save(groups);
        return new ResponseEntity<>(groupMapper.toDto(groups), HttpStatus.CREATED);
    }

    public ResponseEntity<List<GroupDto>> getAllGroups(long userId) {
        var groups = groupRepo.findGroupsByMembersId(userId).stream()
                .map(groupMapper::toDto)
                .toList();
        return new ResponseEntity<List<GroupDto>>(groups, HttpStatus.OK);
    }

    public ResponseEntity<GroupDto> getGroupById(long groupId) {
        var group = groupRepo.findById(groupId);
        if (group.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(groupMapper.toDto(group.get()), HttpStatus.OK);
    }

    public ResponseEntity<GroupDto> joinGroup(String inviteToken, long userId) {
        Groups group = groupRepo.findByInviteToken(inviteToken)
                .orElseThrow(() -> new RuntimeException("Invalid invite link"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (group.getMembers().contains(user)) {
            return new ResponseEntity<>(groupMapper.toDto(group), HttpStatus.OK);
        }

        group.getMembers().add(user);
        groupRepo.save(group);
        return new ResponseEntity<>(groupMapper.toDto(group), HttpStatus.OK);
    }

    public ResponseEntity<String> getInviteLink(long groupId, long userId) {
        Groups group = groupRepo. findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group. getMembers().contains(user)) {
            return new ResponseEntity<>("You are not a member of this group", HttpStatus. FORBIDDEN);
        }

        return new ResponseEntity<>(group.getInviteToken(), HttpStatus.OK);
    }

    public ResponseEntity<Long> getNumberOfMembers(long groupId) {
        Groups group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        long numberOfMembers = group.getMembers().size();
        return new ResponseEntity<>(numberOfMembers, HttpStatus.OK);
    }

    public ResponseEntity<List<GroupMemberDto>> getGroupMembers(long groupId, long userId) {
        Groups group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group.getMembers().contains(user)) {
            throw new RuntimeException("You are not a member of this group");
        }

        List<GroupMemberDto> members = group.getMembers().stream()
                .map(member -> new GroupMemberDto(member.getId(), member.getFullName()))
                .toList();

        return new ResponseEntity<>(members, HttpStatus.OK);
    }


    public ResponseEntity<Void> deleteGroup(long groupId, long userId) {
        Groups group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group.getMembers().contains(user)) {
            throw new RuntimeException("You are not a member of this group");
        }

        if (group.getCreatedBy().getId() !=userId) {
            throw new RuntimeException("Only the group creator can delete the group");
        }

        groupRepo.delete(group);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
