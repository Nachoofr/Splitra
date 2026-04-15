package com.intern.splitra.controller;

import com.intern.splitra.dto.ActivityDto;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.service.ActivityService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping("/splitra/activity/group/{groupId}")
    public ResponseEntity<List<ActivityDto>> getGroupActivities(@PathVariable Long groupId) {
        return activityService.getGroupActivities(groupId);
    }

    @GetMapping("/splitra/activity/all")
    public ResponseEntity<List<ActivityDto>> getAllActivities(@AuthenticationPrincipal UserPrinciple userPrinciple) {
        Long userId = userPrinciple.getUser().getId();
        return activityService.getAllActivitiesForUser(userId);
    }
}