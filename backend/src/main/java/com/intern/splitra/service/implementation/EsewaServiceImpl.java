package com.intern.splitra.service.implementation;

import com.intern.splitra.config.EsewaConfig;
import com.intern.splitra.dto.EsewaPaymentRequestDto;
import com.intern.splitra.dto.EsewaVerifyDto;
import com.intern.splitra.enums.PaymentMethod;
import com.intern.splitra.enums.SettlementStatus;
import com.intern.splitra.model.Settlement;
import com.intern.splitra.repository.SettlementRepo;
import com.intern.splitra.service.EsewaService;
import com.intern.splitra.util.SettlementUtil;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@AllArgsConstructor
public class EsewaServiceImpl implements EsewaService {
    private final SettlementRepo settlementRepo;
    private final EsewaConfig esewaConfig;
    private final RestTemplate restTemplate;
    private final SettlementUtil settlementUtil;

    public ResponseEntity<EsewaPaymentRequestDto> initiatePayment(long groupId, long toUserId, long fromUserId, Double amount) {
        Settlement settlement = settlementRepo.findByGroupIdAndFromUserIdAndToUserIdAndAmountAndPaymentMethod(
                groupId, fromUserId, toUserId, amount, PaymentMethod.ESEWA
        ).orElse(null);

        if(settlement == null) {
            settlement = settlementUtil.initiateSettlement(
                    groupId, toUserId, fromUserId, amount, PaymentMethod.ESEWA);
        }

        String transactionUuid = UUID.randomUUID().toString();
        settlement.setTransactionId(transactionUuid);
        settlementRepo.save(settlement);

        String strAmount = String.valueOf(amount);
        String taxAmount = "0";
        String totalAmount = strAmount;
        String productCode = esewaConfig.getMerchantId();
        String productServiceCharge = "0";
        String productDeliveryCharge = "0";
        String signedFieldNames = "total_amount,transaction_uuid,product_code";
        String signature = generateSignature(totalAmount, transactionUuid, productCode);

        EsewaPaymentRequestDto dto = new EsewaPaymentRequestDto(
                strAmount,
                taxAmount,
                totalAmount,
                transactionUuid,
                productCode,
                productServiceCharge,
                productDeliveryCharge,
                esewaConfig.getSuccessUrl(),
                esewaConfig.getFailureUrl(),
                signedFieldNames,
                signature
        );

        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    public ResponseEntity<Void> verifyPayment(EsewaVerifyDto verifyDto) {
        String url = esewaConfig.getVerifyUrl() +
                "?product_code=" + verifyDto.getProductCode() +
                "&transaction_uuid=" + verifyDto.getTransactionUuid() +
                "&total_amount=" + verifyDto.getTotalAmount();

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

        if (response.getBody() == null) {
            throw new RuntimeException("eSewa verification failed");
        }

        String status = (String) response.getBody().get("status");

        if (!"COMPLETE".equals(status)) {
            throw new RuntimeException("Payment not completed");
        }

        String transactionUuid = verifyDto.getTransactionUuid();
        Settlement settlement = settlementRepo.findByTransactionId(transactionUuid)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));

        settlement.setStatus(SettlementStatus.CONFIRMED);
        settlement.setConfirmedAt(LocalDateTime.now());
        settlementRepo.save(settlement);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    public String generateSignature(String totalAmount, String transactionUuid, String productCode) {
        try {
            String message = "total_amount=" + totalAmount +
                    ",transaction_uuid=" + transactionUuid +
                    ",product_code=" + productCode;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                    "8gBm/:&EnhH.1/q".getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            mac.init(secretKey);
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate signature", e);
        }
    }
}
