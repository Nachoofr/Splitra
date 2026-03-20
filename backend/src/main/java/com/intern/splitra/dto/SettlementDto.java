package com.intern.splitra.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SettlementDto {
    private Long fromUserId;
    private Long toUserId;
    private String from;
    private String to;
    private Long amount;
}
