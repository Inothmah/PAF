package com.group.smartcampus.demo.dto;

import com.group.smartcampus.demo.model.NotificationType;
import lombok.Data;

@Data
public class NotificationRequestDto {
    private String userId;
    private String message;
    private NotificationType type;
    private String referenceId;
}
