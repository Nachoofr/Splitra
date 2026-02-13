package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.ExpenseDto;
import com.intern.splitra.mapper.ExpenseMapper;
import com.intern.splitra.model.Category;
import com.intern.splitra.model.Groups;
import com.intern.splitra.model.User;
import com.intern.splitra.repository.CategoryRepo;
import com.intern.splitra.repository.ExpenseRepo;
import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.ExpenseService;
import enums.GroupStatus;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final UserRepo userRepo;
    private final CategoryRepo categoryRepo;
    ExpenseRepo expenseRepo;
    ExpenseMapper expenseMapper;
    GroupRepo groupRepo;

    public ResponseEntity<ExpenseDto> addExpense(ExpenseDto expenseDto, Long userId, Long groupId) {
        Groups group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long categoryId = expenseDto.getCategory();
        if (categoryId == null) {
            throw new RuntimeException("Category is required");
        }
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!group.getMembers().stream().anyMatch(member -> member.getId() == userId)) {
            throw new RuntimeException("User is not a member of the group");
        }

        if(!category.isGlobal()){
            if (category.getGroup().getId() != groupId){
                throw new RuntimeException("Category does not belong to the group");
            }
        }

        var expense = expenseMapper.toEntity(expenseDto);
        expense.setGroup(group);
        expense.setCreatedBy(user);
        expense.setCategory(category);
        expense.setDate(LocalDateTime.now());

        group.setStatus(GroupStatus.UNSETTLED);
        expenseRepo.save(expense);

        return new ResponseEntity<>(expenseMapper.toDto(expense), HttpStatus.CREATED);
    }

    public ResponseEntity<List<ExpenseDto>> getAllExpenses(){
        var expenses = expenseRepo.findAll().stream()
                .map(expenseMapper::toDto)
                .toList();
        return new ResponseEntity<>(expenses, HttpStatus.OK);
    }
}
