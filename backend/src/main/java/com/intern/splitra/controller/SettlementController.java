package com.intern.splitra.controller;

import com.intern.splitra.constant.SettlementApiEndpointConstants;
import com.intern.splitra.dto.SettlementPaymentDto;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.service.SettlementService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class SettlementController {
    SettlementService settlementService;

    @PostMapping(SettlementApiEndpointConstants.CASH)
    public ResponseEntity<SettlementPaymentDto> initiateCashSettlement (@RequestBody SettlementPaymentDto settlementPaymentDto, @AuthenticationPrincipal UserPrinciple userPrinciple) {
        long fromUserId = userPrinciple.getUser().getId();
        return settlementService.initiateCashSettlement(settlementPaymentDto.getGroupId(), settlementPaymentDto.getToUserId(), fromUserId, settlementPaymentDto.getAmount());
    }

    @PostMapping(SettlementApiEndpointConstants.CONFIRM + "/{settlementId}")
    public ResponseEntity<Void> confirmSettlement(@PathVariable long settlementId, @AuthenticationPrincipal UserPrinciple userPrinciple) {
        long userId = userPrinciple.getUser().getId();
        return settlementService.confirmSettlement(settlementId, userId);
    }
}
