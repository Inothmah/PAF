package com.group.smartcampus.demo.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String googleId;
    private String name;
    private String email;
    private String password;

    private UserRole role = UserRole.USER;

    @CreatedDate
    private LocalDateTime createdAt;
}
