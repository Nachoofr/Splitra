package com.intern.splitra.controller;

import com.intern.splitra.dto.BillScanDto;
import com.intern.splitra.dto.BillScanRequestDto;
import com.intern.splitra.service.OcrService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
public class BillScanController {

    private final OcrService geminiService;

    @PostMapping("/splitra/bill/scan")
    public ResponseEntity<BillScanDto> scanBill(@RequestBody BillScanRequestDto request) {
        return geminiService.scanBill(request);
    }
}