package com.group.smartcampus.demo.dto;

import com.group.smartcampus.demo.model.UserRole;
import lombok.Data;

@Data
public class UserRequestDto {
    private String googleId;
    private String name;
    private String email;
    private String password;
    private UserRole role;
}
