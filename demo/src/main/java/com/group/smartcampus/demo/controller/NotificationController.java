package com.group.smartcampus.demo.controller;

import com.group.smartcampus.demo.dto.NotificationRequestDto;
import com.group.smartcampus.demo.dto.NotificationResponseDto;
import com.group.smartcampus.demo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    // GET /api/notifications - Get for current user (from JWT)
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<List<NotificationResponseDto>> getMyNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            // Query notifications directly by email (since that's how they're stored)
            return ResponseEntity.ok(notificationService.getNotificationsByUserId(userEmail));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // GET /api/notifications/unread-count - Get unread count for current user
    @GetMapping("/unread-count")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<Long> getUnreadCount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            // Query notifications directly by email (since that's how they're stored)
            long count = notificationService.getUnreadCount(userEmail);
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(0L);
        }
    }

    // GET /api/notifications/all - Admin only
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponseDto>> getAll() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    // POST /api/notifications - Create notification (Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationResponseDto> create(@RequestBody NotificationRequestDto dto) {
        return new ResponseEntity<>(notificationService.createNotification(dto), HttpStatus.CREATED);
    }

    // PATCH /api/notifications/{id}/read - Mark as read
    @PatchMapping("/{id}/read")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<NotificationResponseDto> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    // PATCH /api/notifications/mark-all-read - Mark all as read for current user
    @PatchMapping("/mark-all-read")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<Void> markAllAsRead() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            // Query notifications directly by email (since that's how they're stored)
            notificationService.markAllAsRead(userEmail);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE /api/notifications/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
