package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.BalanceDto;
import com.intern.splitra.dto.SettlementDto;
import com.intern.splitra.enums.SettlementStatus;
import com.intern.splitra.model.*;
import com.intern.splitra.repository.ExpenseRepo;
import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.repository.SettlementRepo;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.BalanceService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@AllArgsConstructor
public class BalanceServiceImpl implements BalanceService {
    private final UserRepo userRepo;
    ExpenseRepo expenseRepo;
    GroupRepo groupRepo;
    SettlementRepo settlementRepo;
    private static final Logger log = LoggerFactory.getLogger(BalanceServiceImpl.class);

//    public Map<Long, Double> calculateNet(Long groupId, Map<Long, String> names) {
//        List<Expense> expenses = expenseRepo.findByGroupId(groupId);
//
//        Map<Long, Double> paid = new HashMap<>();
//        Map<Long, Double> owed = new HashMap<>();
//
//        for (Expense expense : expenses) {
//            for (ExpensePayment expensePayment : expense.getPaidBy()) {
//                User payer = expensePayment.getPaidBy();
//                Double amount = expensePayment.getAmountPaid();
//                names.put(payer.getId(), payer.getFullName());
//                paid.put(payer.getId(), paid.getOrDefault(payer.getId(), 0.0) + amount);
//            }
//
//            for (ExpenseSplit expenseSplit : expense.getSplits()) {
//                User payee = expenseSplit.getUserId();
//                Double amount = expenseSplit.getAmount();
//                names.put(payee.getId(), payee.getFullName());
//                owed.put(payee.getId(), owed.getOrDefault(payee.getId(), 0.0) + amount);
//            }
//        }
//
//        Map<Long, Double> netBalance = new HashMap<>();
//        for (Long user : names.keySet()) {
//            double net = paid.getOrDefault(user, 0.0) - owed.getOrDefault(user, 0.0);
//            netBalance.put(user, net);
//        }
//
//        List<Settlement> confirmed = settlementRepo
//                .findByGroupIdAndStatus(groupId, SettlementStatus.CONFIRMED);
//
//        for (Settlement s : confirmed) {
//            netBalance.put(s.getFromUser().getId(),
//                    netBalance.getOrDefault(s.getFromUser().getId(), 0.0) + s.getAmount());
//            netBalance.put(s.getToUser().getId(),
//                    netBalance.getOrDefault(s.getToUser().getId(), 0.0) - s.getAmount());
//        }
//
//        return netBalance;
//    }
public Map<Long, Double> calculateNet(Long groupId, Map<Long, String> names) {
    List<Expense> expenses = expenseRepo.findByGroupId(groupId);

    Map<Long, Double> paid = new HashMap<>();
    Map<Long, Double> owed = new HashMap<>();

    log.info("[net] groupId={}, expensesCount={}", groupId, expenses.size());

    for (Expense expense : expenses) {
        log.info("[net] expenseId={}, expenseAmount={}, splitMethod={}",
                expense.getId(), expense.getAmount(), expense.getSplitMethod());

        // PAID
        for (ExpensePayment expensePayment : expense.getPaidBy()) {
            User payer = expensePayment.getPaidBy();
            Double amount = expensePayment.getAmountPaid();

            log.info("[net]   paidBy payerId={}, payerName={}, amountPaid={}",
                    payer.getId(), payer.getFullName(), amount);

            names.put(payer.getId(), payer.getFullName());
            paid.put(payer.getId(), paid.getOrDefault(payer.getId(), 0.0) + amount);
        }

        // OWED
        for (ExpenseSplit expenseSplit : expense.getSplits()) {
            User payee = expenseSplit.getUserId();
            Double amount = expenseSplit.getAmount();

            log.info("[net]   split userId={}, userName={}, splitAmount={}",
                    payee.getId(), payee.getFullName(), amount);

            names.put(payee.getId(), payee.getFullName());
            owed.put(payee.getId(), owed.getOrDefault(payee.getId(), 0.0) + amount);
        }
    }

    log.info("[net] paid map={}", paid);
    log.info("[net] owed map={}", owed);

    // Build netBalance
    Map<Long, Double> netBalance = new HashMap<>();
    for (Long user : names.keySet()) {
        double net = paid.getOrDefault(user, 0.0) - owed.getOrDefault(user, 0.0);
        netBalance.put(user, net);
        log.info("[net] userId={} name={} paid={} owed={} net={}",
                user, names.get(user),
                paid.getOrDefault(user, 0.0),
                owed.getOrDefault(user, 0.0),
                net);
    }

    // Apply confirmed settlements (THIS MUST BE AFTER netBalance is created)
    List<Settlement> confirmed =
            settlementRepo.findByGroupIdAndStatus(groupId, SettlementStatus.CONFIRMED);

    log.info("[net] confirmedSettlementsCount={}", confirmed.size());

    for (Settlement s : confirmed) {
        log.info("[net] confirmed settlement id={} groupId={} fromUserId={} toUserId={} amount={} method={} status={} txId={} createdAt={} confirmedAt={}",
                s.getId(),
                s.getGroup().getId(),
                s.getFromUser().getId(),
                s.getToUser().getId(),
                s.getAmount(),
                s.getPaymentMethod(),
                s.getStatus(),
                s.getTransactionId(),
                s.getCreatedAt(),
                s.getConfirmedAt());

        netBalance.put(s.getFromUser().getId(),
                netBalance.getOrDefault(s.getFromUser().getId(), 0.0) + s.getAmount());
        netBalance.put(s.getToUser().getId(),
                netBalance.getOrDefault(s.getToUser().getId(), 0.0) - s.getAmount());
    }

    log.info("[net] final netBalance={}", netBalance);
    return netBalance;
}


    public ResponseEntity<List<BalanceDto>> getGroupBalance(long groupId){
        Groups group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

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

//    public ResponseEntity<List<SettlementDto>> getSettlements (long groupId){
//        Groups group = groupRepo.findById(groupId)
//                .orElseThrow(() -> new RuntimeException("Group not found"));
//
//        Map<Long, String> names = new HashMap<>();
//        Map<Long, Double> netBalance = calculateNet(groupId, names);
//
//        List<SettlementDto> settlements = new ArrayList<>();
//
//        PriorityQueue<long[]> receiver = new PriorityQueue<>((a,b) -> Long.compare(b[1], a[1]));
//        PriorityQueue<long[]> payer = new PriorityQueue<>((a,b) -> Long.compare(a[1], b[1]));
//
//       for (Map.Entry<Long, Double> entry : netBalance.entrySet()){
//           long userId = entry.getKey();
//           long amount = Math.round(entry.getValue());
//
//           if(amount > 0){
//               receiver.add(new long[]{userId, amount});
//           }
//           else if(amount < 0){
//                payer.add(new long[]{userId, amount});
//           }
//       }
//
//       while(!receiver.isEmpty() && !payer.isEmpty()){
//           long[] credit = receiver.poll();
//           long[] debt = payer.poll();
//
//           long creditAmount = credit[1];
//           long debtAmount = Math.abs(debt[1]);
//
//           long transfer = Math.min(creditAmount, debtAmount);
//
//           settlements.add(new SettlementDto(debt[0], credit[0], names.get(debt[0]), names.get(credit[0]), transfer));
//
//           long remainingCredit = creditAmount - transfer;
//           long remainingDebt = debtAmount - transfer;
//
//           if (remainingCredit > 0){
//               receiver.add(new long[]{credit[0], remainingCredit});
//           }
//
//           if (remainingDebt > 0){
//               payer.add(new long[]{debt[0], -remainingDebt});
//           }
//
//       }
//
//       return new ResponseEntity<>(settlements, HttpStatus.OK);
//    }
public ResponseEntity<List<SettlementDto>> getSettlements (long groupId){
    Groups group = groupRepo.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));

    Map<Long, String> names = new HashMap<>();
    Map<Long, Double> netBalance = calculateNet(groupId, names);

    log.info("[settlements] groupId={}, netBalance={}", groupId, netBalance);

    List<SettlementDto> settlements = new ArrayList<>();

    PriorityQueue<long[]> receiver = new PriorityQueue<>((a,b) -> Long.compare(b[1], a[1]));
    PriorityQueue<long[]> payer = new PriorityQueue<>((a,b) -> Long.compare(a[1], b[1]));

    for (Map.Entry<Long, Double> entry : netBalance.entrySet()){
        long userId = entry.getKey();
        long amount = Math.round(entry.getValue());

        if(amount > 0){
            receiver.add(new long[]{userId, amount});
            log.info("[settlements] receiver add userId={}, amount={}", userId, amount);
        }
        else if(amount < 0){
            payer.add(new long[]{userId, amount});
            log.info("[settlements] payer add userId={}, amount={}", userId, amount);
        }
    }

    while(!receiver.isEmpty() && !payer.isEmpty()){
        long[] credit = receiver.poll();
        long[] debt = payer.poll();

        long creditAmount = credit[1];
        long debtAmount = Math.abs(debt[1]);

        long transfer = Math.min(creditAmount, debtAmount);

        log.info("[settlements] match debtUserId={}({}), creditUserId={}({}), transfer={}",
                debt[0], debtAmount, credit[0], creditAmount, transfer);

        settlements.add(new SettlementDto(
                debt[0], credit[0],
                names.get(debt[0]), names.get(credit[0]),
                transfer
        ));

        long remainingCredit = creditAmount - transfer;
        long remainingDebt = debtAmount - transfer;

        log.info("[settlements] remainingCredit={}, remainingDebt={}", remainingCredit, remainingDebt);

        // ✅ FIX: re-add receiver with remainingCredit (not remainingDebt)
        if (remainingCredit > 0){
            receiver.add(new long[]{credit[0], remainingCredit});
            log.info("[settlements] receiver re-add userId={}, amount={}", credit[0], remainingCredit);
        }

        if (remainingDebt > 0){
            payer.add(new long[]{debt[0], -remainingDebt});
            log.info("[settlements] payer re-add userId={}, amount={}", debt[0], -remainingDebt);
        }
    }

    log.info("[settlements] final settlements count={}", settlements.size());
    return new ResponseEntity<>(settlements, HttpStatus.OK);
}

    public long getExpectedTransferAmount(long groupId, long fromUserId, long toUserId) {
        Map<Long, String> names = new HashMap<>();
        Map<Long, Double> netBalance = calculateNet(groupId, names);

        PriorityQueue<long[]> receiver = new PriorityQueue<>((a, b) -> Long.compare(b[1], a[1]));
        PriorityQueue<long[]> payer = new PriorityQueue<>((a, b) -> Long.compare(a[1], b[1]));

        for (Map.Entry<Long, Double> entry : netBalance.entrySet()) {
            long userId = entry.getKey();
            long amount = Math.round(entry.getValue());

            if (amount > 0) receiver.add(new long[]{userId, amount});
            else if (amount < 0) payer.add(new long[]{userId, amount});
        }

        while (!receiver.isEmpty() && !payer.isEmpty()) {
            long[] credit = receiver.poll();
            long[] debt = payer.poll();

            long creditAmount = credit[1];
            long debtAmount = Math.abs(debt[1]);

            long transfer = Math.min(creditAmount, debtAmount);

            // if this is the pair we care about, return it
            if (debt[0] == fromUserId && credit[0] == toUserId) {
                return transfer;
            }

            long remainingCredit = creditAmount - transfer;
            long remainingDebt = debtAmount - transfer;

            // IMPORTANT: correct bug here
            if (remainingCredit > 0) receiver.add(new long[]{credit[0], remainingCredit});
            if (remainingDebt > 0) payer.add(new long[]{debt[0], -remainingDebt});
        }

        return 0;
    }


}
