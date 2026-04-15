package com.group.smartcampus.demo.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

@Data
public class BookingRequestDto {
    
    @NotBlank(message = "Resource ID is required")
    private String resourceId;
    
    @NotBlank(message = "Purpose is required")
    @Size(max = 500, message = "Purpose must not exceed 500 characters")
    private String purpose;
    
    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;
    
    @Min(value = 1, message = "Expected attendees must be at least 1")
    @Max(value = 1000, message = "Expected attendees must not exceed 1000")
    private Integer expectedAttendees;
}
