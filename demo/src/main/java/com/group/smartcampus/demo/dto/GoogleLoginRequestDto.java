package com.group.smartcampus.demo.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class GoogleLoginRequestDto {
    @NotBlank(message = "ID Token is required")
    private String idToken;
}
