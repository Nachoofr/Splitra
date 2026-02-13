package com.intern.splitra.controller;

import com.intern.splitra.constant.ExpenseApiEndpointConstants;
import com.intern.splitra.dto.ExpenseDto;
import com.intern.splitra.model.Expense;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.service.ExpenseService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class ExpenseController {

    ExpenseService expenseService;

    @PostMapping(ExpenseApiEndpointConstants.GROUP_EXPENSES)
    public ResponseEntity<ExpenseDto> addExpense(@RequestBody ExpenseDto expense, @AuthenticationPrincipal UserPrinciple userPrinciple, @PathVariable Long groupId) {
        Long userId = userPrinciple.getUser().getId();
        System.out.println("User ID: " + userId);
        System.out.println("Group ID: " + groupId);
        return expenseService.addExpense(expense, userId, groupId);

    }
}
