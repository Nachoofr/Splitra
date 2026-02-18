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
    @Mapping(source="createdBy.id", target = "createdBy")
    @Mapping(source="createdBy.fullName", target = "createdByUsername")
    @Mapping(source="category.name", target = "categoryName")
    ExpenseDto toDto(Expense expense);

    @Mapping(source="splitMethod", target = "splitMethod", qualifiedByName = "mapSplitMethod")
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "group", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "paidBy", ignore = true)
    @Mapping(target = "splits", ignore = true)
    Expense toEntity(ExpenseDto expenseDto);


    @Mapping(source="splitMethod", target = "splitMethod", qualifiedByName = "mapSplitMethod")
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "group", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "paidBy", ignore = true)
    @Mapping(target = "splits", ignore = true)
    Expense update(ExpenseDto expenseDto, @MappingTarget Expense expense);
}
