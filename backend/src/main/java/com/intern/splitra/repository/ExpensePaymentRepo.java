package com.intern.splitra.repository;

import com.intern.splitra.model.ExpensePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpensePaymentRepo extends JpaRepository<ExpensePayment, Long> {
}
