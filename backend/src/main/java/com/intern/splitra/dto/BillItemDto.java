package com.intern.splitra.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BillItemDto {
    private String name;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
}