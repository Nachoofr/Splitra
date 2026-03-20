package com.intern.splitra.service.implementation;

import com.intern.splitra.dto.SettlementPaymentDto;
import com.intern.splitra.enums.PaymentMethod;
import com.intern.splitra.enums.SettlementStatus;
import com.intern.splitra.mapper.SettlementMapper;
import com.intern.splitra.mapper.SettlementMapperImpl;
import com.intern.splitra.model.Groups;
import com.intern.splitra.model.Settlement;
import com.intern.splitra.model.User;
import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.repository.SettlementRepo;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.SettlementService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class SettlementServiceImpl implements SettlementService {
    private final SettlementMapper settlementMapper;
    private final SettlementMapperImpl settlementMapperImpl;
    SettlementRepo settlementRepo;
    GroupRepo groupRepo;
    UserRepo userRepo;

    public ResponseEntity<SettlementPaymentDto> initiateCashSettlement (long groupId, long toUserId, long fromUserId, Double amount) {
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
        settlement.setPaymentMethod(PaymentMethod.CASH);
        settlement.setTransactionId(null);
        settlement.setCreatedAt(LocalDateTime.now());

        SettlementPaymentDto settlementPaymentDto = settlementMapper.toDto(settlement);
        settlementRepo.save(settlement);
        return new ResponseEntity<>(settlementPaymentDto, HttpStatus.OK);
    }

    public ResponseEntity<Void> confirmSettlement(long settlementId, long userId) {
        Settlement settlement = settlementRepo.findById(settlementId)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));

        if (settlement.getStatus() != SettlementStatus.PENDING) {
            throw new RuntimeException("Only pending settlements can be confirmed");
        }

        if (settlement.getToUser().getId() != userId) {
            throw new RuntimeException("Only the receiver can confirm the settlement");
        }

        settlement.setStatus(SettlementStatus.CONFIRMED);
        settlement.setConfirmedAt(LocalDateTime.now());
        settlementRepo.save(settlement);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public ResponseEntity<List<SettlementPaymentDto>> getPendingSettlementsForUser(Long userId) {

        List<Settlement> pending = settlementRepo
                .findByToUserIdAndStatus(userId, SettlementStatus.PENDING);

        List<SettlementPaymentDto> settlementPaymentDto = pending.stream()
                .map(settlementMapper::toDto)
                .toList();

        return new ResponseEntity<>(settlementPaymentDto, HttpStatus.OK);
    }


}
