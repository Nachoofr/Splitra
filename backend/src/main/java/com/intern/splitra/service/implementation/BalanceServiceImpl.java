package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.BalanceDto;
import com.intern.splitra.dto.ExpenseDto;
import com.intern.splitra.model.*;
import com.intern.splitra.repository.ExpenseRepo;
import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.BalanceService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class BalanceServiceImpl implements BalanceService {
    private final UserRepo userRepo;
    ExpenseRepo expenseRepo;
    GroupRepo groupRepo;

    public Map<Long, Double> calculateNet(Long groupId, Map<Long, String> names) {
        List<Expense> expenses = expenseRepo.findByGroupId(groupId);

        Map<Long, Double> paid = new HashMap<>();
        Map<Long, Double> owed = new HashMap<>();

        for (Expense expense : expenses){
            for (ExpensePayment expensePayment : expense.getPaidBy()){
                User payer = expensePayment.getPaidBy();
                Double amount = expensePayment.getAmountPaid();

                names.put(payer.getId(), payer.getFullName());
                paid.put(payer.getId(),paid.getOrDefault(payer.getId(),0.0) + amount);
            }

            for (ExpenseSplit expenseSplit : expense.getSplits()){
                User payee = expenseSplit.getUserId();
                Double amount = expenseSplit.getAmount();

                names.put(payee.getId(), payee.getFullName());
                owed.put(payee.getId(), owed.getOrDefault(payee.getId(),0.0) + amount);
            }
        }

        Map<Long, Double> netBalance = new HashMap<>();
        for (Long user : names.keySet()){
            double net = paid.getOrDefault(user, 0.0) - owed.getOrDefault(user, 0.0);
            netBalance.put(user,net);
        }
        return netBalance;
    }


    public ResponseEntity<List<BalanceDto>> getGroupBalance(long groupId){
        Groups group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));


        List<Expense> expenses = expenseRepo.findByGroupId(groupId);
        Map<Long, String> names = new HashMap<>();
        Map<Long, Double> netBalance = calculateNet(groupId, names);

        List<BalanceDto> balance = new ArrayList<>();
        for (long user : names.keySet()){
            BalanceDto balanceDto = new BalanceDto();
            balanceDto.setUserId(user);
            balanceDto.setUserName(names.get(user));
            balanceDto.setBalance(netBalance.get(user));
            balance.add(balanceDto);
        }
        return new ResponseEntity<>(balance, HttpStatus.OK);
    }



}
