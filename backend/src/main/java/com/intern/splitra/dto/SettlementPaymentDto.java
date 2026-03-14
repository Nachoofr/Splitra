package com.intern.splitra.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.intern.splitra.enums.PaymentMethod;
import com.intern.splitra.enums.SettlementStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SettlementPaymentDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    private Long groupId;

    private Long fromUserId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String fromUserName;

    private Long toUserId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String toUserName;

    private Double amount;

    private PaymentMethod paymentMethod;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private SettlementStatus status;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String transactionId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createdAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime confirmedAt;
}
