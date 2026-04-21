package com.intern.splitra.mapper;

import com.intern.splitra.dto.ExpenseSplitDto;
import com.intern.splitra.model.ExpenseSplit;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ExpenseSplitMapper {

    @Mapping(source="expense.id", target="expenseId")
    @Mapping(source="userId.id", target="userId")
    @Mapping(source="userId.fullName", target="userName")
    ExpenseSplitDto toDto(ExpenseSplit expenseSplit);

    @Mapping(source="expenseId", target="expense.id")
    @Mapping(source="userId", target="userId.id")
    @Mapping(target = "amount", ignore = true)
    ExpenseSplit toEntity(ExpenseSplitDto expenseSplitDto);
}
