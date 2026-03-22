package com.intern.splitra.controller;

import com.intern.splitra.dto.EsewaPaymentRequestDto;
import com.intern.splitra.dto.EsewaVerifyDto;
import com.intern.splitra.dto.SettlementPaymentDto;
import com.intern.splitra.model.SecurityModel.UserPrinciple;
import com.intern.splitra.service.EsewaService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
public class EsewaController {

    private final EsewaService esewaService;

    @PostMapping("/splitra/esewa/initiate")
    public ResponseEntity<EsewaPaymentRequestDto> initiatePayment(@RequestBody SettlementPaymentDto request, @AuthenticationPrincipal UserPrinciple userPrinciple) {
        long fromUserId = userPrinciple.getUser().getId();
        return esewaService.initiatePayment(request.getGroupId(), request.getToUserId(), fromUserId, request.getAmount());
    }

    @PostMapping("/splitra/esewa/verify")
    public ResponseEntity<Void> verifyPayment(@RequestBody EsewaVerifyDto verifyDto) {
        return esewaService.verifyPayment(verifyDto);
    }
}