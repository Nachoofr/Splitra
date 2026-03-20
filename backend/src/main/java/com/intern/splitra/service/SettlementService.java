package com.intern.splitra.service;

import com.intern.splitra.dto.SettlementPaymentDto;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface SettlementService {
    ResponseEntity<SettlementPaymentDto> initiateCashSettlement (long groupId, long toUserId, long fromUserId, Double amount);
    ResponseEntity<Void> confirmSettlement(long settlementId, long userId);
    ResponseEntity<List<SettlementPaymentDto>> getPendingSettlementsForUser(Long userId);
}
