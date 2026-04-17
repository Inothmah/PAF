package com.group.smartcampus.demo.service;

import com.group.smartcampus.demo.dto.NotificationRequestDto;
import com.group.smartcampus.demo.dto.NotificationResponseDto;
import com.group.smartcampus.demo.model.Notification;
import com.group.smartcampus.demo.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationResponseDto createNotification(NotificationRequestDto dto) {
        Notification notification = new Notification();
        notification.setUserId(dto.getUserId());
        notification.setMessage(dto.getMessage());
        notification.setType(dto.getType());
        notification.setReferenceId(dto.getReferenceId());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);
        return mapToResponseDto(saved);
    }

    public List<NotificationResponseDto> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<NotificationResponseDto> getAllNotifications() {
        return notificationRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public NotificationResponseDto markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapToResponseDto(updated);
    }

    public void deleteNotification(String id) {
        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("Notification not found");
        }
        notificationRepository.deleteById(id);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.findByUserIdAndIsRead(userId, false).size();
    }

    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsRead(userId, false);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    private NotificationResponseDto mapToResponseDto(Notification notification) {
        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setReferenceId(notification.getReferenceId());
        return dto;
    }
}
