package com.intern.splitra.service;

import com.intern.splitra.dto.EsewaPaymentRequestDto;
import com.intern.splitra.dto.EsewaVerifyDto;
import org.springframework.http.ResponseEntity;

public interface EsewaService {
    ResponseEntity<Void> verifyPayment(EsewaVerifyDto verifyDto);
    ResponseEntity<EsewaPaymentRequestDto> initiatePayment(long groupId, long toUserId, long fromUserId, Double amount);
    String generateSignature(String totalAmount, String transactionUuid, String productCode);
}
