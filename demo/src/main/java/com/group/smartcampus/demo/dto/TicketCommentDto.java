package com.group.smartcampus.demo.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketCommentDto {

    private String id;
    private String userId;
    private String userName;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isEdited;
    private Boolean canEdit;
    private Boolean canDelete;
}
