package com.intern.splitra.service.implementation.analytics;

import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.service.GroupAnalyticsService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class GroupAnalyticsServiceImpl implements GroupAnalyticsService {
    GroupRepo groupRepo;

    public ResponseEntity<Integer> getTotalGroups(long userId){
        int totalGroups = groupRepo.countByMembersId(userId);
        return new ResponseEntity<>(totalGroups, HttpStatus.OK);
    }
}
