package com.intern.splitra.controller.analytics;

import com.intern.splitra.constant.GroupApiEndpointConstants;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.service.GroupAnalyticsService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class GroupAnalyticsController {
    GroupAnalyticsService groupAnalyticsService;

    @GetMapping(GroupApiEndpointConstants.GROUPS_COUNT)
    public ResponseEntity<Integer> getTotalGroups(@AuthenticationPrincipal UserPrinciple userPrinciple){
        long userId = userPrinciple.getUser().getId();
        return groupAnalyticsService.getTotalGroups(userId);
    }
}
