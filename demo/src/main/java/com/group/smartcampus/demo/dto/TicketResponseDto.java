package com.group.smartcampus.demo.dto;

import com.group.smartcampus.demo.model.Priority;
import com.group.smartcampus.demo.model.TicketCategory;
import com.group.smartcampus.demo.model.TicketStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketResponseDto {

    private String id;
    private String resourceId;
    private String resourceName;
    private String location;
    private TicketCategory category;
    private String description;
    private Priority priority;
    private String contactDetails;
    private TicketStatus status;
    private String assignedToId;
    private String assignedToName;
    private String createdById;
    private String createdByName;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketAttachmentDto> attachments;
    private List<TicketCommentDto> comments;
    private long commentCount;
}
