package com.intern.splitra.service;

import com.intern.splitra.dto.ActivityDto;
import com.intern.splitra.enums.ActivityType;
import com.intern.splitra.model.Groups;
import com.intern.splitra.model.User;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ActivityService {
    ResponseEntity<List<ActivityDto>> getGroupActivities(Long groupId);
    ResponseEntity<List<ActivityDto>> getAllActivitiesForUser(Long userId);
    void logActivity(ActivityType type, Groups group, User actor, String title, String description, Double amount);
}