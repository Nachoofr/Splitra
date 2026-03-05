package com.intern.splitra.controller.analytics;

import com.intern.splitra.constant.ExpenseApiEndpointConstants;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.service.ExpenseAnalyticsService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class ExpenseAnalyticsController {
    ExpenseAnalyticsService expenseAnalyticsService;

    @GetMapping(ExpenseApiEndpointConstants.EXPENSES_COUNT)
    public ResponseEntity<Integer> getTotalNumberOfExpenses(@AuthenticationPrincipal UserPrinciple userPrinciple){
        long userId = userPrinciple.getUser().getId();
        return expenseAnalyticsService.getTotalNumberOfExpenses(userId);
    }
}
