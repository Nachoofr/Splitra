package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.GroupDto;
import com.intern.splitra.mapper.GroupMapper;
import com.intern.splitra.model.User;
import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.GroupService;
import enums.GroupStatus;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

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
        groupRepo.save(groups);
        return new ResponseEntity<>(groupMapper.toDto(groups), HttpStatus.CREATED);
    }

}
