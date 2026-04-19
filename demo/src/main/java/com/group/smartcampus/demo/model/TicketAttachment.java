package com.group.smartcampus.demo.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "ticket_attachments")
public class TicketAttachment {

    @Id
    private String id;

    private String ticketId;

    private String originalFileName;

    private String storedFileName;

    private String filePath;

    private String contentType;

    private Long fileSize;

    @CreatedDate
    private LocalDateTime uploadedAt;
}
