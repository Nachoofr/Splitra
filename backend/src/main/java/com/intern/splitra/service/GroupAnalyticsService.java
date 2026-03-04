package com.intern.splitra.service;

import org.springframework.http.ResponseEntity;

public interface GroupAnalyticsService{
    ResponseEntity<Integer> getTotalGroups(long userId);
}
