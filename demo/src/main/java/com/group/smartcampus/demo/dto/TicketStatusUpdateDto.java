package com.group.smartcampus.demo.dto;

import com.group.smartcampus.demo.model.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketStatusUpdateDto {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String resolutionNotes;

    private String rejectionReason;

    private String assignedToId;
}
