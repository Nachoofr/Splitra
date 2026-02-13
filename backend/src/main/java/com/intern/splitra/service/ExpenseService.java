package com.intern.splitra.service;


import com.intern.splitra.dto.ExpenseDto;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ExpenseService {
    ResponseEntity<ExpenseDto> addExpense(ExpenseDto expenseDto, Long userId, Long groupId);
    ResponseEntity<List<ExpenseDto>> getAllExpenses();
}
