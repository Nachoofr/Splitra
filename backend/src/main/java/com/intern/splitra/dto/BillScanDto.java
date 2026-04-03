package com.intern.splitra.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BillScanDto {
    private String merchantName;
    private Double totalAmount;
    private String date;
    private String suggestedCategory;
    private List<BillItemDto> items;
    private Double vatAmount;
    private String rawText;
    private Boolean success;
    private String errorMessage;
}