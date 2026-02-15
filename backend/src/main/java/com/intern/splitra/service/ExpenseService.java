package com.intern.splitra.service;


import com.intern.splitra.dto.ExpenseDto;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ExpenseService {
    ResponseEntity<ExpenseDto> addExpense(ExpenseDto expenseDto, Long userId, Long groupId);
    ResponseEntity<List<ExpenseDto>> getAllExpenses();
    ResponseEntity<List<ExpenseDto>> getExpensesByGroup(long groupId, long userId);
    ResponseEntity<Double> getTotalExpenseByGroup(long groupId, long userId);
    ResponseEntity<ExpenseDto> editExpense(long groupId, long userId, long expenseId, ExpenseDto expenseDto);
    ResponseEntity<Void> deleteExpense(long groupId, long userId, long expenseId);
}
