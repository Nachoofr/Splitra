package com.intern.splitra.controller;

import com.intern.splitra.service.ExpenseSplitService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class ExpenseSplitController {

    ExpenseSplitService expenseSplitService;
}
