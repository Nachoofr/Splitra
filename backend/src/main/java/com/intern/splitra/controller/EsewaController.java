package com.intern.splitra.controller;

import com.intern.splitra.dto.EsewaPaymentRequestDto;
import com.intern.splitra.dto.EsewaVerifyDto;
import com.intern.splitra.dto.SettlementPaymentDto;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.service.BalanceService;
import com.intern.splitra.service.EsewaService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
public class EsewaController {

    private final EsewaService esewaService;

    private final BalanceService balanceService;

    @PostMapping("/splitra/esewa/initiate")
    public ResponseEntity<EsewaPaymentRequestDto> initiatePayment(
            @RequestBody SettlementPaymentDto request,
            @AuthenticationPrincipal UserPrinciple userPrinciple
    ) {
        long fromUserId = userPrinciple.getUser().getId();

        long expected = balanceService.getExpectedTransferAmount(
                request.getGroupId(),
                fromUserId,
                request.getToUserId()
        );

        long requested = Math.round(request.getAmount());

        if (expected <= 0) {
            throw new RuntimeException("No settlement is due for this pair right now.");
        }

        if (requested != expected) {
            throw new RuntimeException("Invalid settlement amount. Expected " + expected + " but got " + requested);
        }

        return esewaService.initiatePayment(
                request.getGroupId(),
                request.getToUserId(),
                fromUserId,
                request.getAmount()
        );
    }

    @PostMapping("/splitra/esewa/verify")
    public ResponseEntity<Void> verifyPayment(@RequestBody EsewaVerifyDto verifyDto) {
        return esewaService.verifyPayment(verifyDto);
    }
}