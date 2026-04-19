package com.group.smartcampus.demo.dto;

import com.group.smartcampus.demo.model.BookingStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingResponseDto {
    
    private String id;
    private String resourceId;
    private String userId;
    private String purpose;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer expectedAttendees;
    private String rejectionReason;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields for response
    private String resourceName;
    private String resourceType;
    private String resourceLocation;
    private String userName;
}
