package com.intern.splitra.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;


@Entity
@Data
@EqualsAndHashCode(exclude = {"expense"})
@ToString(exclude = {"expense"})
public class ExpensePayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User paidBy;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double amountPaid;

}
