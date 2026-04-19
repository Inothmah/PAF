package com.group.smartcampus.demo.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId; // Reference to User.id
    private String message;
    private NotificationType type;
    private Boolean isRead = false;

    @CreatedDate
    private LocalDateTime createdAt;

    private String referenceId; // bookingId or ticketId
}
