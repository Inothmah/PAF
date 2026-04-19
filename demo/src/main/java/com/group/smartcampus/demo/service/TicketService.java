package com.group.smartcampus.demo.service;

import com.group.smartcampus.demo.dto.*;
import com.group.smartcampus.demo.model.*;
import com.group.smartcampus.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final IncidentTicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    @Value("${file.upload-dir:tickets}")
    private String uploadDir;

    // Create new incident ticket
    public TicketResponseDto createTicket(TicketRequestDto requestDto, String createdById) {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setResourceId(requestDto.getResourceId());
        ticket.setLocation(requestDto.getLocation());
        ticket.setCategory(requestDto.getCategory());
        ticket.setDescription(requestDto.getDescription());
        ticket.setPriority(requestDto.getPriority());
        ticket.setContactDetails(requestDto.getContactDetails());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedById(createdById);

        IncidentTicket savedTicket = ticketRepository.save(ticket);
        return mapToResponseDto(savedTicket);
    }

    // Get all tickets (admin view)
    public List<TicketResponseDto> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Get tickets by status
    public List<TicketResponseDto> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Get tickets created by user
    public List<TicketResponseDto> getUserTickets(String userId) {
        return ticketRepository.findByCreatedById(userId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Get tickets assigned to technician
    public List<TicketResponseDto> getAssignedTickets(String technicianId) {
        return ticketRepository.findByAssignedToId(technicianId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Get ticket by ID with details
    public TicketResponseDto getTicketById(String ticketId, String currentUserId) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return mapToResponseDtoWithDetails(ticket, currentUserId);
    }

    // Update ticket status (workflow management)
    public TicketResponseDto updateTicketStatus(String ticketId, TicketStatusUpdateDto updateDto, String updatedById) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketStatus oldStatus = ticket.getStatus();
        TicketStatus newStatus = updateDto.getStatus();

        // Validate workflow transitions
        switch (newStatus) {
            case IN_PROGRESS:
                if (!ticket.canBeAssigned()) {
                    throw new RuntimeException("Ticket cannot be assigned. Current status: " + ticket.getStatus());
                }
                ticket.setAssignedToId(updateDto.getAssignedToId());
                break;
            case RESOLVED:
                if (!ticket.canBeResolved()) {
                    throw new RuntimeException("Ticket cannot be resolved. Current status: " + ticket.getStatus());
                }
                ticket.setResolutionNotes(updateDto.getResolutionNotes());
                break;
            case CLOSED:
                if (!ticket.canBeClosed()) {
                    throw new RuntimeException("Ticket cannot be closed. Current status: " + ticket.getStatus());
                }
                break;
            case REJECTED:
                if (!ticket.canBeRejected()) {
                    throw new RuntimeException("Ticket cannot be rejected. Current status: " + ticket.getStatus());
                }
                ticket.setRejectionReason(updateDto.getRejectionReason());
                break;
            default:
                break;
        }

        ticket.setStatus(newStatus);
        IncidentTicket updatedTicket = ticketRepository.save(ticket);

        // Create notifications based on status change
        try {
            createStatusChangeNotification(updatedTicket, oldStatus, newStatus, updateDto);
        } catch (Exception e) {
            // Log error but don't fail the status update
            System.err.println("Failed to create notification: " + e.getMessage());
        }

        return mapToResponseDto(updatedTicket);
    }

    private void createStatusChangeNotification(IncidentTicket ticket, TicketStatus oldStatus, TicketStatus newStatus, TicketStatusUpdateDto updateDto) {
        NotificationRequestDto notificationDto = new NotificationRequestDto();
        notificationDto.setType(NotificationType.TICKET);
        notificationDto.setReferenceId(ticket.getId());

        String categoryName = ticket.getCategory() != null ? ticket.getCategory().toString().replace("_", " ") : "Ticket";

        switch (newStatus) {
            case IN_PROGRESS:
                // Notify assigned technician
                if (ticket.getAssignedToId() != null) {
                    notificationDto.setUserId(ticket.getAssignedToId());
                    notificationDto.setMessage("A new " + categoryName + " ticket has been assigned to you.");
                    notificationService.createNotification(notificationDto);
                }
                // Notify ticket creator
                if (ticket.getCreatedById() != null) {
                    notificationDto.setUserId(ticket.getCreatedById());
                    notificationDto.setMessage("Your " + categoryName + " ticket is now being worked on.");
                    notificationService.createNotification(notificationDto);
                }
                break;
            case RESOLVED:
                // Notify ticket creator
                if (ticket.getCreatedById() != null) {
                    notificationDto.setUserId(ticket.getCreatedById());
                    notificationDto.setMessage("Your " + categoryName + " ticket has been resolved.");
                    notificationService.createNotification(notificationDto);
                }
                break;
            case REJECTED:
                // Notify ticket creator
                if (ticket.getCreatedById() != null) {
                    notificationDto.setUserId(ticket.getCreatedById());
                    String reason = updateDto.getRejectionReason();
                    notificationDto.setMessage("Your " + categoryName + " ticket has been rejected." + 
                        (reason != null && !reason.isEmpty() ? " Reason: " + reason : ""));
                    notificationService.createNotification(notificationDto);
                }
                break;
            case CLOSED:
                // Notify ticket creator
                if (ticket.getCreatedById() != null) {
                    notificationDto.setUserId(ticket.getCreatedById());
                    notificationDto.setMessage("Your " + categoryName + " ticket has been closed.");
                    notificationService.createNotification(notificationDto);
                }
                // Notify assigned technician
                if (ticket.getAssignedToId() != null && !ticket.getAssignedToId().equals(ticket.getCreatedById())) {
                    notificationDto.setUserId(ticket.getAssignedToId());
                    notificationDto.setMessage("The " + categoryName + " ticket you were working on has been closed.");
                    notificationService.createNotification(notificationDto);
                }
                break;
            default:
                break;
        }
    }

    // Add comment to ticket
    public TicketCommentDto addComment(String ticketId, CommentRequestDto commentDto, String userId) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.canAddComments()) {
            throw new RuntimeException("Cannot add comments to a closed or rejected ticket");
        }

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setUserId(userId);
        comment.setContent(commentDto.getContent());

        TicketComment savedComment = commentRepository.save(comment);

        // Create notification for ticket creator (if commenter is not the creator)
        try {
            if (!userId.equals(ticket.getCreatedById()) && ticket.getCreatedById() != null) {
                NotificationRequestDto notificationDto = new NotificationRequestDto();
                notificationDto.setUserId(ticket.getCreatedById());
                notificationDto.setType(NotificationType.COMMENT);
                notificationDto.setReferenceId(ticketId);
                
                String categoryName = ticket.getCategory() != null ? ticket.getCategory().toString().replace("_", " ") : "ticket";
                notificationDto.setMessage("New comment on your " + categoryName + " ticket.");
                notificationService.createNotification(notificationDto);
            }
            
            // If ticket is assigned and commenter is not the assigned technician, notify them too
            if (ticket.getAssignedToId() != null && !userId.equals(ticket.getAssignedToId())) {
                NotificationRequestDto techNotification = new NotificationRequestDto();
                techNotification.setUserId(ticket.getAssignedToId());
                techNotification.setType(NotificationType.COMMENT);
                techNotification.setReferenceId(ticketId);
                
                String categoryName = ticket.getCategory() != null ? ticket.getCategory().toString().replace("_", " ") : "ticket";
                techNotification.setMessage("New comment on assigned " + categoryName + " ticket.");
                notificationService.createNotification(techNotification);
            }
        } catch (Exception e) {
            // Log error but don't fail the comment creation
            System.err.println("Failed to create notification: " + e.getMessage());
        }

        return mapToCommentDto(savedComment, userId);
    }

    // Get comments for a ticket
    public List<TicketCommentDto> getTicketComments(String ticketId, String currentUserId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(comment -> mapToCommentDto(comment, currentUserId))
                .collect(Collectors.toList());
    }

    // Edit comment (only by owner)
    public TicketCommentDto editComment(String commentId, String newContent, String userId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setContent(newContent);
        comment.setIsEdited(true);
        TicketComment updatedComment = commentRepository.save(comment);
        return mapToCommentDto(updatedComment, userId);
    }

    // Delete comment (only by owner or admin)
    public void deleteComment(String commentId, String userId, boolean isAdmin) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(userId) && !isAdmin) {
            throw new RuntimeException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    // Add attachment to ticket (max 3)
    public TicketAttachmentDto addAttachment(String ticketId, MultipartFile file, String userId) throws IOException {
        // Check attachment count
        long attachmentCount = attachmentRepository.countByTicketId(ticketId);
        if (attachmentCount >= 3) {
            throw new RuntimeException("Maximum 3 attachments allowed per ticket");
        }

        // Validate file type (images only)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir, "tickets");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFileName = file.getOriginalFilename();
        String storedFileName = UUID.randomUUID().toString() + "_" + originalFileName;
        Path filePath = uploadPath.resolve(storedFileName);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Save attachment record
        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicketId(ticketId);
        attachment.setOriginalFileName(originalFileName);
        attachment.setStoredFileName(storedFileName);
        attachment.setFilePath(filePath.toString());
        attachment.setContentType(contentType);
        attachment.setFileSize(file.getSize());

        TicketAttachment savedAttachment = attachmentRepository.save(attachment);
        return mapToAttachmentDto(savedAttachment);
    }

    // Get attachments for a ticket
    public List<TicketAttachmentDto> getTicketAttachments(String ticketId) {
        return attachmentRepository.findByTicketId(ticketId).stream()
                .map(this::mapToAttachmentDto)
                .collect(Collectors.toList());
    }

    // Delete attachment
    public void deleteAttachment(String attachmentId, String userId, boolean isAdmin) throws IOException {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        // Get the ticket to check ownership
        IncidentTicket ticket = ticketRepository.findById(attachment.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getCreatedById().equals(userId) && !isAdmin) {
            throw new RuntimeException("You can only delete attachments from your own tickets");
        }

        // Delete file
        Path filePath = Paths.get(attachment.getFilePath());
        Files.deleteIfExists(filePath);

        // Delete record
        attachmentRepository.delete(attachment);
    }

    // Get attachment as a Resource for file serving
    public Resource getAttachmentResource(String attachmentId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        try {
            Path filePath = Paths.get(attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + attachment.getStoredFileName());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    public String getAttachmentContentType(String attachmentId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        return attachment.getContentType();
    }

    // Delete ticket and all related data
    public void deleteTicket(String ticketId, String userId, boolean isAdmin) throws IOException {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getCreatedById().equals(userId) && !isAdmin) {
            throw new RuntimeException("You can only delete your own tickets");
        }

        // Delete attachments
        List<TicketAttachment> attachments = attachmentRepository.findByTicketId(ticketId);
        for (TicketAttachment attachment : attachments) {
            Path filePath = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(filePath);
        }
        attachmentRepository.deleteByTicketId(ticketId);

        // Delete comments
        commentRepository.deleteByTicketId(ticketId);

        // Delete ticket
        ticketRepository.delete(ticket);
    }

    // Mapping methods
    private TicketResponseDto mapToResponseDto(IncidentTicket ticket) {
        TicketResponseDto dto = new TicketResponseDto();
        dto.setId(ticket.getId());
        dto.setResourceId(ticket.getResourceId());
        dto.setLocation(ticket.getLocation());
        dto.setCategory(ticket.getCategory());
        dto.setDescription(ticket.getDescription());
        dto.setPriority(ticket.getPriority());
        dto.setContactDetails(ticket.getContactDetails());
        dto.setStatus(ticket.getStatus());
        dto.setAssignedToId(ticket.getAssignedToId());
        dto.setCreatedById(ticket.getCreatedById());
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setRejectionReason(ticket.getRejectionReason());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());

        // Include attachments by default
        dto.setAttachments(getTicketAttachments(ticket.getId()));

        // Load user names
        if (ticket.getCreatedById() != null) {
            userRepository.findById(ticket.getCreatedById())
                    .ifPresent(user -> dto.setCreatedByName(user.getName()));
        }
        if (ticket.getAssignedToId() != null) {
            userRepository.findById(ticket.getAssignedToId())
                    .ifPresent(user -> dto.setAssignedToName(user.getName()));
        }

        // Load resource name
        if (ticket.getResourceId() != null) {
            resourceRepository.findById(ticket.getResourceId())
                    .ifPresent(resource -> dto.setResourceName(resource.getName()));
        }

        // Count comments
        dto.setCommentCount(commentRepository.countByTicketId(ticket.getId()));

        return dto;
    }

    private TicketResponseDto mapToResponseDtoWithDetails(IncidentTicket ticket, String currentUserId) {
        TicketResponseDto dto = mapToResponseDto(ticket);
        dto.setAttachments(getTicketAttachments(ticket.getId()));
        dto.setComments(getTicketComments(ticket.getId(), currentUserId));
        return dto;
    }

    private TicketCommentDto mapToCommentDto(TicketComment comment, String currentUserId) {
        TicketCommentDto dto = new TicketCommentDto();
        dto.setId(comment.getId());
        dto.setUserId(comment.getUserId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setIsEdited(comment.getIsEdited());

        // Load user name
        userRepository.findById(comment.getUserId())
                .ifPresent(user -> dto.setUserName(user.getName()));

        // Set permissions
        boolean isOwner = comment.getUserId().equals(currentUserId);
        dto.setCanEdit(isOwner);
        dto.setCanDelete(isOwner);

        return dto;
    }

    private TicketAttachmentDto mapToAttachmentDto(TicketAttachment attachment) {
        TicketAttachmentDto dto = new TicketAttachmentDto();
        dto.setId(attachment.getId());
        dto.setOriginalFileName(attachment.getOriginalFileName());
        dto.setContentType(attachment.getContentType());
        dto.setFileSize(attachment.getFileSize());
        dto.setUploadedAt(attachment.getUploadedAt());
        dto.setFileUrl("/api/tickets/attachments/" + attachment.getId());
        return dto;
    }
}
