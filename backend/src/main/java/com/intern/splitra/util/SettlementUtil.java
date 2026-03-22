package com.intern.splitra.util;

import com.intern.splitra.enums.PaymentMethod;
import com.intern.splitra.enums.SettlementStatus;
import com.intern.splitra.model.Groups;
import com.intern.splitra.model.Settlement;
import com.intern.splitra.model.User;
import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.repository.SettlementRepo;
import com.intern.splitra.repository.UserRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@AllArgsConstructor
public class SettlementUtil {

    private final GroupRepo groupRepo;
    private final UserRepo userRepo;
    private final SettlementRepo settlementRepo;

    public Settlement initiateSettlement(
            long groupId, long toUserId, long fromUserId,
            Double amount, PaymentMethod paymentMethod) {

        Groups group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User fromUser = userRepo.findById(fromUserId)
                .orElseThrow(() -> new RuntimeException("Payer not found"));

        User toUser = userRepo.findById(toUserId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (!group.getMembers().contains(fromUser)) {
            throw new RuntimeException("Payer is not a member of this group");
        }

        if (!group.getMembers().contains(toUser)) {
            throw new RuntimeException("Receiver is not a member of this group");
        }

        if (fromUserId == toUserId) {
            throw new RuntimeException("Payer and receiver cannot be the same person");
        }

        if (amount <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        Settlement settlement = new Settlement();
        settlement.setGroup(group);
        settlement.setFromUser(fromUser);
        settlement.setToUser(toUser);
        settlement.setAmount(amount);
        settlement.setStatus(SettlementStatus.PENDING);
        settlement.setPaymentMethod(paymentMethod);
        settlement.setTransactionId(null);
        settlement.setCreatedAt(LocalDateTime.now());

        return settlementRepo.save(settlement);
    }
}