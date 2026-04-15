package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.ActivityDto;
import com.intern.splitra.enums.ActivityType;
import com.intern.splitra.model.Activity;
import com.intern.splitra.model.Groups;
import com.intern.splitra.model.User;
import com.intern.splitra.repository.ActivityRepo;
import com.intern.splitra.service.ActivityService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepo activityRepo;

    @Override
    public ResponseEntity<List<ActivityDto>> getGroupActivities(Long groupId) {
        List<Activity> activities = activityRepo.findAllByGroupIdOrderByCreatedAtDesc(groupId);
        return new ResponseEntity<>(activities.stream().map(this::toDto).collect(Collectors.toList()), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<List<ActivityDto>> getAllActivitiesForUser(Long userId) {
        List<Activity> activities = activityRepo.findAllActivitiesForUser(userId);
        return new ResponseEntity<>(activities.stream().map(this::toDto).collect(Collectors.toList()), HttpStatus.OK);
    }

    @Override
    @Transactional
    public void logActivity(ActivityType type, Groups group, User actor, String title, String description, Double amount) {
        Activity activity = new Activity();
        activity.setActivityType(type);
        activity.setGroup(group);
        activity.setActor(actor);
        activity.setTitle(title);
        activity.setDescription(description);
        activity.setAmount(amount);
        activity.setCreatedAt(LocalDateTime.now());
        activityRepo.save(activity);
    }

    private ActivityDto toDto(Activity activity) {
        ActivityDto dto = new ActivityDto();
        dto.setId(activity.getId());
        dto.setActivityType(activity.getActivityType().name());
        dto.setGroupId(activity.getGroup().getId());
        dto.setGroupName(activity.getGroup().getGroupName());
        dto.setActorId(activity.getActor().getId());
        dto.setActorName(activity.getActor().getFullName());
        dto.setTitle(activity.getTitle());
        dto.setDescription(activity.getDescription());
        dto.setAmount(activity.getAmount());
        dto.setCreatedAt(activity.getCreatedAt());
        return dto;
    }
}