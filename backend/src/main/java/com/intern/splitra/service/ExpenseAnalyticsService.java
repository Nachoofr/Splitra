package com.intern.splitra.service;

import org.springframework.http.ResponseEntity;

public interface ExpenseAnalyticsService {
    ResponseEntity<Integer> getTotalNumberOfExpenses(long userId);
}
