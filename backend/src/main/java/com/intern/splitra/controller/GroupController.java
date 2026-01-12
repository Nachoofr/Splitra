package com.intern.splitra.controller;

import com.intern.splitra.constant.GroupApiEndpointConstants;
import com.intern.splitra.constant.UserApiEndpointConstants;
import com.intern.splitra.dto.GroupDto;
import com.intern.splitra.dto.UserDto;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.service.GroupService;
import com.intern.splitra.service.SecurityService.MyUserDetailsService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class GroupController {

    GroupService groupService;

    @PostMapping(GroupApiEndpointConstants.GROUPS)
    public ResponseEntity<GroupDto> createGroup(@RequestBody GroupDto groupDto, @AuthenticationPrincipal UserPrinciple userPrinciple) {
        long userId = userPrinciple.getUser().getId();
        return groupService.createGroup(groupDto,userId);
    }

}
