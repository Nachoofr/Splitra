package com.intern.splitra.mapper;

import com.intern.splitra.dto.ExpenseDto;
import com.intern.splitra.model.Expense;
import com.intern.splitra.util.MapperUtil;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {MapperUtil.class, ExpensePaymentMapper.class})
public interface ExpenseMapper {

    @Mapping(source="category.id", target = "category")
    @Mapping(source="splitMethod", target = "splitMethod")
    @Mapping(source="group.id", target = "groupId")
    ExpenseDto toDto(Expense expense);

    @Mapping(source="category", target = "category.id")
    @Mapping(source="splitMethod", target = "splitMethod", qualifiedByName = "mapSplitMethod")
    @Mapping(source="groupId", target = "group.id")
    Expense toEntity(ExpenseDto expenseDto);

    @Mapping(source="category", target = "category.id")
    @Mapping(source="splitMethod", target = "splitMethod", qualifiedByName = "mapSplitMethod")
    @Mapping(source="groupId", target = "group.id")
    Expense update(ExpenseDto expenseDto, @MappingTarget Expense expense);
}
