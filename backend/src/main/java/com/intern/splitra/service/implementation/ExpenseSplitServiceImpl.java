package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.ExpenseSplitDto;
import com.intern.splitra.dto.ExpenseSplitRequestDto;
import com.intern.splitra.dto.ItemDto;
import com.intern.splitra.dto.ItemSplitEntryDto;
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

import java.util.*;

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
            case PERCENTWISE ->  percentageSplit(expense.getId(), expenseSplitRequestDto.getPercentageSplitId(), user.getId());
            default -> throw new RuntimeException("Invalid splitMethod");
//            case ITEMWISE ->
        };
    }


    public ResponseEntity<List<ExpenseSplitDto>> percentageSplit(long expenseId, Map<Long, Double > userIds, long loggedInUserId) {
        if(userIds.size() < 2){
            throw new RuntimeException("At least two users are required for splitting the expense");
        }

        Expense expense = expenseRepo.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        Groups group = expense.getGroup();

        if (!group.getMembers().stream().anyMatch(member -> member.getId() == loggedInUserId)){
            throw new RuntimeException("User is not a member of the group");
        }

        for (long userId : userIds.keySet()) {
            if (!group.getMembers().stream().anyMatch(member -> member.getId() == userId)){
                throw new RuntimeException("User of userId "+ userId + " is not a member of the group");
            }
        }

        double totalPercentage = userIds.values().stream().mapToDouble(Double::doubleValue).sum();
        if (totalPercentage != 100){
            throw new RuntimeException("Total percentage of users are not equal to 100");
        }

        List<ExpenseSplit> splitData = new ArrayList<>();

        for  (Map.Entry<Long, Double> userId : userIds.entrySet()) {
            User  user = userRepo.findById(userId.getKey())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            double splitAmount = (userId.getValue()/100) * expense.getAmount();

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


    public ResponseEntity<List<ExpenseSplitDto>> itemwiseSplit(long expenseId, List<ItemSplitEntryDto> entries, List<ItemDto> items, long loggedInUserId) {

        if (entries == null || entries.isEmpty())
            throw new RuntimeException("Item split entries cannot be empty");
        if (items == null || items.isEmpty())
            throw new RuntimeException("Items list cannot be empty");

        Expense expense = expenseRepo.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        Groups group = expense.getGroup();

        if (group.getMembers().stream().noneMatch(m -> m.getId() == loggedInUserId))
            throw new RuntimeException("User is not a member of the group");

        for (ItemSplitEntryDto entry : entries)
            if (group.getMembers().stream().noneMatch(m -> m.getId() == entry.getUserId()))
                throw new RuntimeException("User " + entry.getUserId() + " is not a member of the group");

        Map<Integer, Double> indexAmountMap = new HashMap<>();
        for (ItemDto item : items)
            indexAmountMap.put(item.getIndex(), item.getAmount());

        Map<Integer, Long> indexUserCountMap = new HashMap<>();
        for (ItemSplitEntryDto entry : entries)
            for (Integer idx : entry.getItemIndexes())
                indexUserCountMap.merge(idx, 1L, Long::sum);

        Map<Long, Double> userAmounts = new LinkedHashMap<>();
        long lastUserId = -1;

        for (ItemSplitEntryDto entry : entries) {
            double userTotal = 0.0;

            for (Integer idx : entry.getItemIndexes()) {
                Double itemAmount = indexAmountMap.get(idx);
                if (itemAmount == null)
                    throw new RuntimeException("Item index " + idx + " not found in items list");

                long userCount = indexUserCountMap.get(idx);
                userTotal += itemAmount / userCount;
            }

            userAmounts.merge(entry.getUserId(), userTotal, Double::sum);
            lastUserId = entry.getUserId();
        }

        double calculatedTotal = userAmounts.values().stream()
                .mapToDouble(Double::doubleValue).sum();
        double remainder = expense.getAmount() - calculatedTotal;

        if (Math.abs(remainder) > 0.0001 && lastUserId != -1)
            userAmounts.merge(lastUserId, remainder, Double::sum);

        List<ExpenseSplit> splitData = new ArrayList<>();
        for (Map.Entry<Long, Double> entry : userAmounts.entrySet()) {
            User user = userRepo.findById(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("User not found: " + entry.getKey()));
            ExpenseSplit es = new ExpenseSplit();
            es.setExpense(expense);
            es.setUserId(user);
            es.setAmount(entry.getValue());
            splitData.add(es);
        }

        expenseSplitRepo.deleteAllByExpenseId(expenseId);
        expenseSplitRepo.saveAll(splitData);

        return new ResponseEntity<>(
                splitData.stream().map(expenseSplitMapper::toDto).toList(),
                HttpStatus.OK);
    }



    public ResponseEntity<Map<String, Double>> getSplitDetails(long expenseId){
        List<ExpenseSplit> expenseSplits = expenseSplitRepo.findAllByExpenseId(expenseId);

        Map<String, Double> splitDetails = new HashMap<>();

        for (ExpenseSplit expenseSplit : expenseSplits) {
            String userName = expenseSplit.getUserId().getFullName();
            double amount = expenseSplit.getAmount();
            splitDetails.put(userName, amount);
        }

        return new ResponseEntity<>(splitDetails, HttpStatus.OK);
    }


}
