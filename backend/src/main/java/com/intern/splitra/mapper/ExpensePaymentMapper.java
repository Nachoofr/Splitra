package com.intern.splitra.mapper;

import com.intern.splitra.dto.ExpensePaymentDto;
import com.intern.splitra.model.Expense;
import com.intern.splitra.model.ExpensePayment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ExpensePaymentMapper {

    @Mapping(source="expense.id", target="expenseId")
    @Mapping(source="paidBy.id", target="paidByUserId")
    @Mapping(source="paidBy.fullName", target="paidByUserName")
    ExpensePaymentDto toDto(ExpensePayment expensePayment);

    @Mapping(source="expenseId", target="expense.id")
    @Mapping(source="paidByUserId", target="paidBy.id")
    ExpensePayment toEntity(ExpensePaymentDto expensePaymentDto);

    @Mapping(source="expenseId", target="expense.id")
    @Mapping(source="paidByUserId", target="paidBy.id")
    ExpensePayment update(ExpensePaymentDto expensePaymentDto, @MappingTarget ExpensePayment expensePayment);
}
