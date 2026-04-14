package com.intern.splitra.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseSplitRequestDto {
    private List<Long> equalSplitId;
    private Map<Long, Double> percentageSplitId;
    private List<ItemSplitEntryDto> itemwiseSplit;
    private List<ItemDto> items;
}
