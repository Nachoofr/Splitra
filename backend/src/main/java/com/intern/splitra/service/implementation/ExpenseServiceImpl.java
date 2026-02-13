package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.ExpenseDto;
import com.intern.splitra.dto.ExpensePaymentDto;
import com.intern.splitra.mapper.ExpenseMapper;
import com.intern.splitra.mapper.ExpensePaymentMapper;
import com.intern.splitra.model.Category;
import com.intern.splitra.model.ExpensePayment;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final UserRepo userRepo;
    private final CategoryRepo categoryRepo;
    private final ExpenseRepo expenseRepo;
    private final ExpenseMapper expenseMapper;
    private final GroupRepo groupRepo;


    @Transactional
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

        if (expenseDto.getPaidBy() == null || expenseDto.getPaidBy().isEmpty()) {
            throw new RuntimeException("At least one person must pay for this expense");
        }

        double totalPaid = expenseDto.getPaidBy().stream()
                .mapToDouble(ExpensePaymentDto::getAmountPaid)
                .sum();

        if (totalPaid != expenseDto.getAmount()) {
            throw new RuntimeException("Total amount paid must be equal to the expense amount");
        }

        var expense = expenseMapper.toEntity(expenseDto);
        expense.setGroup(group);
        expense.setCreatedBy(user);
        expense.setCategory(category);
        expense.setDate(LocalDateTime.now());
        group.setStatus(GroupStatus.UNSETTLED);

        Set<ExpensePayment> payments = new HashSet<>();
        for (ExpensePaymentDto expensePaymentDto : expenseDto.getPaidBy()) {
            User paidBy = userRepo.findById(expensePaymentDto.getPaidByUserId())
                    .orElseThrow(() -> new RuntimeException("User not found for payment"));

            if (!group.getMembers().stream().anyMatch(member -> member.getId() == paidBy.getId())) {
                throw new RuntimeException("User is not a member of the group");
            }

            ExpensePayment expensePayment = new ExpensePayment();
            expensePayment.setExpense(expense);
            expensePayment.setPaidBy(paidBy);
            expensePayment.setAmountPaid(expensePaymentDto.getAmountPaid());
            payments.add(expensePayment);
        }
        expense.setPaidBy(payments);
        expenseRepo.save(expense);
        return new ResponseEntity<>(expenseMapper.toDto(expense), HttpStatus.CREATED);
    }


    public ResponseEntity<List<ExpenseDto>> getAllExpenses(){
        var expenses = expenseRepo.findAll().stream()
                .map(expenseMapper::toDto)
                .toList();
        return new ResponseEntity<>(expenses, HttpStatus.OK);
    }


    public ResponseEntity<List<ExpenseDto>> getExpensesByGroup(long groupId, long userId){
        Groups group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group.getMembers().stream().anyMatch(member -> member.getId() == userId)){
            throw new RuntimeException("User is not a member of the group");
        }

        var expenses = expenseRepo.findALlByGroupId(groupId).stream()
                .map(expenseMapper::toDto)
                .toList();

        return new ResponseEntity<>(expenses, HttpStatus.OK);
    }
}
