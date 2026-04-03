package com.intern.splitra.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BillScanRequestDto {
    private String imageBase64;
    private String mimeType;
}