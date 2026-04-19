package com.group.smartcampus.demo.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

@Data
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @Min(value = 1, message = "Expected attendees must be at least 1")
    private Integer expectedAttendees;

    private String rejectionReason;

    @NotNull
    private BookingStatus status = BookingStatus.PENDING;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Helper method to check if booking time ranges overlap
    public boolean overlapsWith(LocalDateTime otherStart, LocalDateTime otherEnd) {
        return this.startTime.isBefore(otherEnd) && otherStart.isBefore(this.endTime);
    }

    // Helper method to check if booking can be cancelled
    public boolean canBeCancelled() {
        return this.status == BookingStatus.APPROVED;
    }

    // Helper method to check if booking can be approved
    public boolean canBeApproved() {
        return this.status == BookingStatus.PENDING;
    }

    // Helper method to check if booking can be rejected
    public boolean canBeRejected() {
        return this.status == BookingStatus.PENDING;
    }
}
