package com.intern.splitra.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private long id;
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String profilePicture;

    @JsonIgnore
    private String active;
}
