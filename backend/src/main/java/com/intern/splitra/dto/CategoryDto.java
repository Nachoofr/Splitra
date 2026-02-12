package com.intern.splitra.dto;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    private String name;

    private Long groupId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean isGlobal;

    @JsonGetter("isGlobal")
    public Boolean isGlobal() {
        return this.groupId == null;
    }
}
