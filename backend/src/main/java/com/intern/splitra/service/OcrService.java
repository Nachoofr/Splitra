package com.intern.splitra.service;

import com.intern.splitra.dto.BillScanDto;
import com.intern.splitra.dto.BillScanRequestDto;
import org.springframework.http.ResponseEntity;

public interface OcrService {
    ResponseEntity<BillScanDto> scanBill(BillScanRequestDto request);
}