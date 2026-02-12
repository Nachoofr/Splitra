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
    @Mapping(source="paidBy.id", target="paidBy")
    ExpensePaymentDto toDto(Expense expense);

    @Mapping(source="expenseId", target="expense.id")
    @Mapping(source="paidBy", target="paidBy.id")
    ExpensePayment toEntity(ExpensePaymentDto expensePaymentDto);

    @Mapping(source="expenseId", target="expense.id")
    @Mapping(source="paidBy", target="paidBy.id")
    ExpensePayment update(ExpensePaymentDto expensePaymentDto, @MappingTarget ExpensePayment expensePayment);
}
