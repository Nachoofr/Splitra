package com.intern.splitra.controller;

import com.intern.splitra.constant.ExpenseApiEndpointConstants;
import com.intern.splitra.dto.ExpenseDto;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.service.ExpenseService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
public class ExpenseController {

    ExpenseService expenseService;

    @PostMapping(ExpenseApiEndpointConstants.GROUP_EXPENSES)
    public ResponseEntity<ExpenseDto> addExpense(@RequestBody ExpenseDto expense, @AuthenticationPrincipal UserPrinciple userPrinciple, @PathVariable Long groupId) {
        Long userId = userPrinciple.getUser().getId();
        return expenseService.addExpense(expense, userId, groupId);
    }

    @GetMapping(ExpenseApiEndpointConstants.EXPENSES)
    public ResponseEntity<List<ExpenseDto>> getAllExpenses() {
        return expenseService.getAllExpenses();
    }

    @GetMapping(ExpenseApiEndpointConstants.GROUP_EXPENSES)
    public ResponseEntity<List<ExpenseDto>> getExpensesByGroup(@AuthenticationPrincipal UserPrinciple userPrinciple, @PathVariable Long groupId) {
        long userId = userPrinciple.getUser().getId();
        return expenseService.getExpensesByGroup(groupId, userId);
    }
}
