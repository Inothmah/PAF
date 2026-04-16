package com.group.smartcampus.demo.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketAttachmentDto {

    private String id;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private String fileUrl;
}
