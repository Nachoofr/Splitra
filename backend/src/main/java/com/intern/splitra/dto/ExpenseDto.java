package com.intern.splitra.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    private String description;

    private double amount;

    private String category;

    private String splitMethod;

    private Long groupId;
}
