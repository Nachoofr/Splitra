package com.intern.splitra.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivityDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    private String activityType;

    private Long groupId;
    private String groupName;

    private Long actorId;
    private String actorName;

    private String title;
    private String description;
    private Double amount;

    private LocalDateTime createdAt;
}