package com.group.smartcampus.demo.controller;

import com.group.smartcampus.demo.dto.*;
import com.group.smartcampus.demo.model.TicketStatus;
import com.group.smartcampus.demo.service.TicketService;
import com.group.smartcampus.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;

    // Create new incident ticket with optional attachments
    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketResponseDto> createTicket(
            @Valid @RequestPart("ticket") TicketRequestDto requestDto,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            UserResponseDto user = userService.getUserByEmail(userEmail);
            String userId = user.getId();
            TicketResponseDto createdTicket = ticketService.createTicket(requestDto, userId);

            // Process attachments if provided
            if (attachments != null && !attachments.isEmpty()) {
                for (MultipartFile file : attachments) {
                    if (!file.isEmpty()) {
                        ticketService.addAttachment(createdTicket.getId(), file, userId);
                    }
                }
                // Reload ticket with attachments
                createdTicket = ticketService.getTicketById(createdTicket.getId(), userId);
            }

            return new ResponseEntity<>(createdTicket, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Get all tickets (admin view)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<List<TicketResponseDto>> getAllTickets(
            @RequestParam(required = false) TicketStatus status) {

        try {
            List<TicketResponseDto> tickets;
            if (status != null) {
                tickets = ticketService.getTicketsByStatus(status);
            } else {
                tickets = ticketService.getAllTickets();
            }
            return ResponseEntity.ok(tickets);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get current user's tickets
    @GetMapping("/my")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<List<TicketResponseDto>> getUserTickets() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        try {
            if (isAdmin) {
                return ResponseEntity.ok(ticketService.getAllTickets());
            }
            
            UserResponseDto user = userService.getUserByEmail(userEmail);
            List<TicketResponseDto> tickets = ticketService.getUserTickets(user.getId(), userEmail);
            return ResponseEntity.ok(tickets);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get tickets assigned to technician
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponseDto>> getAssignedTickets() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            // Get user by email to retrieve their MongoDB ID
            UserResponseDto user = userService.getUserByEmail(userEmail);
            List<TicketResponseDto> tickets = ticketService.getAssignedTickets(user.getId());
            return ResponseEntity.ok(tickets);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get ticket by ID with full details
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketResponseDto> getTicketById(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            UserResponseDto user = userService.getUserByEmail(userEmail);
            TicketResponseDto ticket = ticketService.getTicketById(id, user.getId());
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Update ticket status (workflow management)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketResponseDto> updateTicketStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketStatusUpdateDto updateDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            UserResponseDto user = userService.getUserByEmail(userEmail);
            TicketResponseDto updatedTicket = ticketService.updateTicketStatus(id, updateDto, user.getId());
            return ResponseEntity.ok(updatedTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Add comment to ticket
    @PostMapping("/{id}/comments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketCommentDto> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentRequestDto commentDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            UserResponseDto user = userService.getUserByEmail(userEmail);
            TicketCommentDto comment = ticketService.addComment(id, commentDto, user.getId());
            return new ResponseEntity<>(comment, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get comments for a ticket
    @GetMapping("/{id}/comments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<List<TicketCommentDto>> getTicketComments(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            UserResponseDto user = userService.getUserByEmail(userEmail);
            List<TicketCommentDto> comments = ticketService.getTicketComments(id, user.getId());
            return ResponseEntity.ok(comments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Edit comment
    @PatchMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketCommentDto> editComment(
            @PathVariable String commentId,
            @Valid @RequestBody CommentRequestDto commentDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            UserResponseDto user = userService.getUserByEmail(userEmail);
            TicketCommentDto updatedComment = ticketService.editComment(commentId, commentDto.getContent(), user.getId());
            return ResponseEntity.ok(updatedComment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Delete comment
    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<Void> deleteComment(@PathVariable String commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        try {
            UserResponseDto user = userService.getUserByEmail(userEmail);
            ticketService.deleteComment(commentId, user.getId(), isAdmin);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Add attachment to ticket
    @PostMapping("/{id}/attachments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketAttachmentDto> addAttachment(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            UserResponseDto user = userService.getUserByEmail(userEmail);
            TicketAttachmentDto attachment = ticketService.addAttachment(id, file, user.getId());
            return new ResponseEntity<>(attachment, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Get attachments for a ticket
    @GetMapping("/{id}/attachments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<List<TicketAttachmentDto>> getTicketAttachments(@PathVariable String id) {
        try {
            List<TicketAttachmentDto> attachments = ticketService.getTicketAttachments(id);
            return ResponseEntity.ok(attachments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get actual file content
    @GetMapping("/attachments/{attachmentId}")
    public ResponseEntity<Resource> getAttachmentFile(@PathVariable String attachmentId) {
        try {
            Resource resource = ticketService.getAttachmentResource(attachmentId);
            String contentType = ticketService.getAttachmentContentType(attachmentId);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete attachment
    @DeleteMapping("/attachments/{attachmentId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<Void> deleteAttachment(@PathVariable String attachmentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        try {
            UserResponseDto user = userService.getUserByEmail(userEmail);
            ticketService.deleteAttachment(attachmentId, user.getId(), isAdmin);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete ticket
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        try {
            UserResponseDto user = userService.getUserByEmail(userEmail);
            ticketService.deleteTicket(id, user.getId(), isAdmin);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
