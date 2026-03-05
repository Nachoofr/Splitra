package com.intern.splitra.service.implementation.analytics;

import com.intern.splitra.model.ExpenseSplit;
import com.intern.splitra.repository.ExpenseRepo;
import com.intern.splitra.repository.ExpenseSplitRepo;
import com.intern.splitra.service.ExpenseAnalyticsService;
import lombok.AllArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ExpenseAnalyticsServiceImpl implements ExpenseAnalyticsService {
    ExpenseSplitRepo expenseSplitRepo;

    public ResponseEntity<Integer> getTotalNumberOfExpenses(long userId){
        int expenseCount = expenseSplitRepo.countByUserIdId(userId);
        return new ResponseEntity<>(expenseCount, HttpStatus.OK);
    }
}
