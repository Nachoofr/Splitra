package com.intern.splitra.repository;

import com.intern.splitra.model.Expense;
import com.intern.splitra.model.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseSplitRepo extends JpaRepository<ExpenseSplit, Long> {
    long deleteAllByExpenseId(long expenseId);
    List<ExpenseSplit> findAllByExpenseId(long expenseId);
    int countByUserIdId(long userId);
}
