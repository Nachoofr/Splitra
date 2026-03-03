package com.intern.splitra.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.intern.splitra.model.User;
import enums.GroupStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    private String groupName;

    private String groupPicture;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String Status;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long createdBy;

    @JsonProperty(access = JsonProperty. Access.READ_ONLY)
    private String inviteToken;

}
