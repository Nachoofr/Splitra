package com.intern.splitra.service;

import com.intern.splitra.dto.BalanceDto;
import com.intern.splitra.dto.SettlementDto;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface BalanceService {
    ResponseEntity<List<BalanceDto>> getGroupBalance(long groupId);
    ResponseEntity<List<SettlementDto>> getSettlements (long groupId);
}
