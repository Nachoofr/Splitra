package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.ExpenseSplitDto;
import com.intern.splitra.dto.ExpenseSplitRequestDto;
import com.intern.splitra.mapper.ExpenseSplitMapper;
import com.intern.splitra.model.Expense;
import com.intern.splitra.model.ExpenseSplit;
import com.intern.splitra.model.Groups;
import com.intern.splitra.model.User;
import com.intern.splitra.repository.ExpenseRepo;
import com.intern.splitra.repository.ExpenseSplitRepo;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.ExpenseSplitService;
import lombok.AllArgsConstructor;
import org.aspectj.weaver.ast.Var;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class ExpenseSplitServiceImpl implements ExpenseSplitService {

    ExpenseSplitRepo expenseSplitRepo;
    UserRepo userRepo;
    ExpenseRepo expenseRepo;
    ExpenseSplitMapper expenseSplitMapper;

    public ResponseEntity<List<ExpenseSplitDto>> equalSplit(long expenseId, List<Long> userIds, long loggedInUserId ) {

        if(userIds.size() < 2){
            throw new RuntimeException("At least two users are required for splitting the expense");
        }

        Expense expense = expenseRepo.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        Groups group = expense.getGroup();

        if (!group.getMembers().stream().anyMatch(member -> member.getId() == loggedInUserId)){
            throw new RuntimeException("User is not a member of the group");
        }

        for (long userId : userIds) {
            if (!group.getMembers().stream().anyMatch(member -> member.getId() == userId)){
                throw new RuntimeException("User of userId "+ userId + " is not a member of the group");
            }
        }

        double totalAmount = expense.getAmount();
        int numberOfUsers = userIds.size();

        double splitAmount = totalAmount / numberOfUsers;

        List<ExpenseSplit> splitData = new ArrayList<>();

        for (long userId : userIds) {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ExpenseSplit expenseSplit = new ExpenseSplit();
            expenseSplit.setExpense(expense);
            expenseSplit.setUserId(user);
            expenseSplit.setAmount(splitAmount);

            splitData.add(expenseSplit);
        }

        expenseSplitRepo.deleteAllByExpenseId(expenseId);

        expenseSplitRepo.saveAll(splitData);

        List<ExpenseSplitDto> splitDto = splitData.stream()
                .map(expenseSplitMapper::toDto)
                .toList();

        return new ResponseEntity<>(splitDto, HttpStatus.OK);
    }

    public ResponseEntity<List<ExpenseSplitDto>> splitExpense(Expense expense, ExpenseSplitRequestDto expenseSplitRequestDto, User user){
        var splitMethod = expense.getSplitMethod();
        return switch (splitMethod) {
            case EQUALLY -> equalSplit(expense.getId(), expenseSplitRequestDto.getEqualSplitId(), user.getId());
            default -> throw new RuntimeException("Invalid splitMethod");
//            case PERCENTWISE ->
//            case ITEMWISE ->
        };

    }


}
