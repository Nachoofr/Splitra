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
import com.intern.splitra.util.GroupUtil;
import com.intern.splitra.util.SettlementUtil;
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
    private final SettlementUtil settlementUtil;
    private final GroupUtil groupUtil;



    public ResponseEntity<SettlementPaymentDto> initiateCashSettlement(long groupId, long toUserId, long fromUserId, Double amount) {
        Settlement settlement = settlementUtil.initiateSettlement(groupId, toUserId, fromUserId, amount, PaymentMethod.CASH);

        return new ResponseEntity<>(settlementMapper.toDto(settlement), HttpStatus.OK);
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

        groupUtil.groupStatusUpdate(settlement.getGroup().getId());
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
