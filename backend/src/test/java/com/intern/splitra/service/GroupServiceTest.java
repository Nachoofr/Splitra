package com.intern.splitra.service;

import com.intern.splitra.dto.GroupDto;
import com.intern.splitra.mapper.GroupMapper;
import com.intern.splitra.model.Groups;
import com.intern.splitra.model.User;
import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.implementation.GroupServiceImpl;
import enums.GroupStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock private GroupMapper groupMapper;
    @Mock private GroupRepo groupRepo;
    @Mock private UserRepo userRepo;
    @Mock private ActivityService activityService;

    @InjectMocks
    private GroupServiceImpl groupService;

    private User member;
    private User outsider;
    private User creator;
    private Groups group;

    @BeforeEach
    void setUp() {
        creator = new User();
        creator.setId(1L);
        creator.setFullName("Creator");

        member = new User();
        member.setId(2L);
        member.setFullName("Member");

        outsider = new User();
        outsider.setId(3L);
        outsider.setFullName("Outsider");

        Set<User> members = new HashSet<>();
        members.add(creator);
        members.add(member);

        group = new Groups();
        group.setId(10L);
        group.setGroupName("Test Group");
        group.setStatus(GroupStatus.CREATED);
        group.setCreatedBy(creator);
        group.setInviteToken("valid-token");
        group.setMembers(members);
    }

    // ─── getGroupById() ──────────────────────────────────────────────────────────

    @Test
    void getGroupById_WhenGroupNotFound_ShouldThrow() {
        when(groupRepo.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> groupService.getGroupById(99L, 1L));

        assertEquals("Group not found", ex.getMessage());
    }

    @Test
    void getGroupById_WhenUserNotFound_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> groupService.getGroupById(10L, 99L));

        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void getGroupById_WhenUserNotMember_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(3L)).thenReturn(Optional.of(outsider));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> groupService.getGroupById(10L, 3L));

        assertEquals("You are not a member of this group", ex.getMessage());
    }

    @Test
    void getGroupById_WhenMemberExists_ShouldReturnGroup() {
        GroupDto dto = new GroupDto();
        dto.setGroupName("Test Group");

        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(2L)).thenReturn(Optional.of(member));
        when(groupMapper.toDto(group)).thenReturn(dto);

        ResponseEntity<GroupDto> response = groupService.getGroupById(10L, 2L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Test Group", response.getBody().getGroupName());
    }


    @Test
    void joinGroup_WhenInvalidToken_ShouldThrow() {
        when(groupRepo.findByInviteToken("bad-token")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> groupService.joinGroup("bad-token", 3L));

        assertEquals("Invalid invite link", ex.getMessage());
    }

    @Test
    void joinGroup_WhenAlreadyMember_ShouldThrow() {
        when(groupRepo.findByInviteToken("valid-token")).thenReturn(Optional.of(group));
        when(userRepo.findById(2L)).thenReturn(Optional.of(member));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> groupService.joinGroup("valid-token", 2L));

        assertEquals("You are already a member of this group", ex.getMessage());
    }

    @Test
    void joinGroup_WhenNewUser_ShouldAddMemberAndReturn200() {
        GroupDto dto = new GroupDto();
        when(groupRepo.findByInviteToken("valid-token")).thenReturn(Optional.of(group));
        when(userRepo.findById(3L)).thenReturn(Optional.of(outsider));
        when(groupRepo.save(any(Groups.class))).thenReturn(group);
        when(groupMapper.toDto(group)).thenReturn(dto);
        doNothing().when(activityService).logActivity(any(), any(), any(), any(), any(), any());

        ResponseEntity<GroupDto> response = groupService.joinGroup("valid-token", 3L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(group.getMembers().contains(outsider));
        verify(groupRepo).save(group);
    }


    @Test
    void deleteGroup_WhenNotGroupCreator_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(2L)).thenReturn(Optional.of(member));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> groupService.deleteGroup(10L, 2L));

        assertEquals("Only the group creator can delete the group", ex.getMessage());
        verify(groupRepo, never()).delete(any());
    }


    @Test
    void deleteGroup_WhenUserNotMember_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(3L)).thenReturn(Optional.of(outsider));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> groupService.deleteGroup(10L, 3L));

        assertEquals("You are not a member of this group", ex.getMessage());
    }

    @Test
    void updateGroup_WhenNotGroupCreator_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(2L)).thenReturn(Optional.of(member));

        GroupDto dto = new GroupDto();
        dto.setGroupName("New Name");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> groupService.updateGroup(10L, dto, 2L));

        assertEquals("Only the group creator can edit the group", ex.getMessage());
        verify(groupRepo, never()).save(any());
    }

    @Test
    void updateGroup_WhenCreator_ShouldUpdateAndReturn() {
        GroupDto dto = new GroupDto();
        dto.setGroupName("Updated Name");

        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(groupRepo.save(any(Groups.class))).thenReturn(group);
        when(groupMapper.toDto(group)).thenReturn(dto);

        ResponseEntity<GroupDto> response = groupService.updateGroup(10L, dto, 1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(groupRepo).save(group);
        verify(groupMapper).update(dto, group);
    }
}