package com.intern.splitra.service;

import com.intern.splitra.dto.ExpenseSplitDto;
import com.intern.splitra.dto.ExpenseSplitRequestDto;
import com.intern.splitra.model.Expense;
import com.intern.splitra.model.User;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ExpenseSplitService {
    ResponseEntity<List<ExpenseSplitDto>> splitExpense(Expense expense, ExpenseSplitRequestDto expenseSplitRequestDto, User user);
}
