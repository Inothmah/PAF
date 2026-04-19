package com.group.smartcampus.demo.dto;

import com.group.smartcampus.demo.model.UserRole;
import lombok.Data;

@Data
public class AuthResponseDto {
    private String token;
    private String type = "Bearer";
    private String id;
    private String email;
    private String name;
    private UserRole role;
}
