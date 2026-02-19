package com.intern.splitra.controller;

import com.intern.splitra.service.ExpenseSplitService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@AllArgsConstructor
public class ExpenseSplitController {

    ExpenseSplitService expenseSplitService;

    @GetMapping("/splitra/expense/{expenseId}/split/details")
    public ResponseEntity<Map<String, Double>> getSplitDetails(@PathVariable long expenseId) {
        return expenseSplitService.getSplitDetails(expenseId);
    }
}
