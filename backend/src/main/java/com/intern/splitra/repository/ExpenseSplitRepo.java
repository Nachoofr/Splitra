package com.intern.splitra.repository;

import com.intern.splitra.model.Expense;
import com.intern.splitra.model.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseSplitRepo extends JpaRepository<ExpenseSplit, Long> {
    ExpenseSplit deleteAllByExpenseId(long expenseId);
}
