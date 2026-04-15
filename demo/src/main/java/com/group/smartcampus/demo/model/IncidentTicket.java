package com.group.smartcampus.demo.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@Document(collection = "incident_tickets")
public class IncidentTicket {

    @Id
    private String id;

    private String resourceId;
    
    private String location;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private String contactDetails;

    private TicketStatus status = TicketStatus.OPEN;

    private String assignedToId;

    private String createdById;

    private String resolutionNotes;

    private String rejectionReason;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Helper methods for workflow validation
    public boolean canBeAssigned() {
        return this.status == TicketStatus.OPEN;
    }

    public boolean canBeResolved() {
        return this.status == TicketStatus.IN_PROGRESS;
    }

    public boolean canBeClosed() {
        return this.status == TicketStatus.RESOLVED;
    }

    public boolean canBeRejected() {
        return this.status == TicketStatus.OPEN || this.status == TicketStatus.IN_PROGRESS;
    }

    public boolean canAddComments() {
        return this.status != TicketStatus.CLOSED && this.status != TicketStatus.REJECTED;
    }
}
