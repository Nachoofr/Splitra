package com.intern.splitra.dto;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QrCodeDto {
    private Long id;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String qrImageData;
}
