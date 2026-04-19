package com.group.smartcampus.demo.dto;

import com.group.smartcampus.demo.model.UserRole;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponseDto {
    private String id;
    private String googleId;
    private String name;
    private String email;
    private UserRole role;
    private LocalDateTime createdAt;
}
