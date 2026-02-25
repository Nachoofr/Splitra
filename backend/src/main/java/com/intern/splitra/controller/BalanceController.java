package com.intern.splitra.controller;

import com.intern.splitra.dto.BalanceDto;
import com.intern.splitra.service.BalanceService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
public class BalanceController {
    BalanceService balanceService;

    @GetMapping("splitra/balance/{groupId}")
    public ResponseEntity<List<BalanceDto>> getGroupBalance(@PathVariable long groupId){
        return balanceService.getGroupBalance(groupId);
    }
}
