package com.group.smartcampus.demo.dto;

import com.group.smartcampus.demo.model.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponseDto {
    private String id;
    private String userId;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String referenceId;
}
