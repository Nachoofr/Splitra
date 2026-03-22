package com.intern.splitra.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EsewaVerifyDto {
    private String productCode;
    private String transactionUuid;
    private String totalAmount;
}
