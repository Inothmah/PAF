package com.group.smartcampus.demo.service;

import com.group.smartcampus.demo.dto.BookingRequestDto;
import com.group.smartcampus.demo.dto.BookingResponseDto;
import com.group.smartcampus.demo.dto.NotificationRequestDto;
import com.group.smartcampus.demo.model.Booking;
import com.group.smartcampus.demo.model.BookingStatus;
import com.group.smartcampus.demo.model.NotificationType;
import com.group.smartcampus.demo.model.Resource;
import com.group.smartcampus.demo.repository.BookingRepository;
import com.group.smartcampus.demo.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    // Create new booking request
    public BookingResponseDto createBooking(BookingRequestDto requestDto, String userId) {
        // Validate time range
        if (requestDto.getStartTime().isAfter(requestDto.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        // Check if resource exists and is active
        var resource = resourceRepository.findById(requestDto.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + requestDto.getResourceId()));
        
        if (!"ACTIVE".equals(resource.getStatus().name())) {
            throw new RuntimeException("Resource is not available for booking");
        }

        // Check for scheduling conflicts
        if (hasBookingConflict(requestDto.getResourceId(), requestDto.getStartTime(), requestDto.getEndTime())) {
            throw new RuntimeException("Resource is already booked for the requested time range");
        }

        Booking booking = new Booking();
        booking.setResourceId(requestDto.getResourceId());
        booking.setUserId(userId);
        booking.setPurpose(requestDto.getPurpose());
        booking.setStartTime(requestDto.getStartTime());
        booking.setEndTime(requestDto.getEndTime());
        booking.setExpectedAttendees(requestDto.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponseDto(savedBooking);
    }

    // Get user's bookings
    public List<BookingResponseDto> getUserBookings(String userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Get all bookings (admin only)
    public List<BookingResponseDto> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Get pending bookings (admin only)
    public List<BookingResponseDto> getPendingBookings() {
        List<Booking> bookings = bookingRepository.findByStatus(BookingStatus.PENDING);
        return bookings.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Approve booking (admin only)
    public BookingResponseDto approveBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (!booking.canBeApproved()) {
            throw new RuntimeException("Booking cannot be approved in current status: " + booking.getStatus());
        }

        // Check for conflicts before approving
        if (hasBookingConflict(booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), bookingId)) {
            throw new RuntimeException("Cannot approve booking due to scheduling conflict");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);

        // Create notification for the user
        try {
            Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
            String resourceName = resource != null ? resource.getName() : "Unknown Resource";

            NotificationRequestDto notificationDto = new NotificationRequestDto();
            notificationDto.setUserId(booking.getUserId());
            notificationDto.setMessage("Your booking for " + resourceName + " has been approved.");
            notificationDto.setType(NotificationType.BOOKING);
            notificationDto.setReferenceId(bookingId);
            notificationService.createNotification(notificationDto);
        } catch (Exception e) {
            // Log error but don't fail the booking approval
            System.err.println("Failed to create notification: " + e.getMessage());
        }

        return mapToResponseDto(updatedBooking);
    }

    // Reject booking (admin only)
    public BookingResponseDto rejectBooking(String bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (!booking.canBeRejected()) {
            throw new RuntimeException("Booking cannot be rejected in current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);

        // Create notification for the user
        try {
            Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
            String resourceName = resource != null ? resource.getName() : "Unknown Resource";

            NotificationRequestDto notificationDto = new NotificationRequestDto();
            notificationDto.setUserId(booking.getUserId());
            notificationDto.setMessage("Your booking for " + resourceName + " has been rejected." + 
                (reason != null && !reason.isEmpty() ? " Reason: " + reason : ""));
            notificationDto.setType(NotificationType.BOOKING);
            notificationDto.setReferenceId(bookingId);
            notificationService.createNotification(notificationDto);
        } catch (Exception e) {
            // Log error but don't fail the booking rejection
            System.err.println("Failed to create notification: " + e.getMessage());
        }

        return mapToResponseDto(updatedBooking);
    }

    // Cancel booking
    public BookingResponseDto cancelBooking(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        // Check if user owns the booking or is admin
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if (!booking.canBeCancelled()) {
            throw new RuntimeException("Booking cannot be cancelled in current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponseDto(updatedBooking);
    }

    // Check for booking conflicts
    private boolean hasBookingConflict(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        return hasBookingConflict(resourceId, startTime, endTime, null);
    }

    // Check for booking conflicts (excluding specific booking)
    private boolean hasBookingConflict(String resourceId, LocalDateTime startTime, LocalDateTime endTime, String excludeBookingId) {
        List<Booking> conflictingBookings = bookingRepository.findByResourceIdAndStatusAndStartTimeBetween(
                resourceId, 
                BookingStatus.APPROVED, 
                startTime.minusMinutes(1), // Add buffer time
                endTime.plusMinutes(1) // Add buffer time
        );

        return conflictingBookings.stream()
                .anyMatch(booking -> excludeBookingId == null || !booking.getId().equals(excludeBookingId));
    }

    // Get booking by ID
    public BookingResponseDto getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        return mapToResponseDto(booking);
    }

    // Get bookings by status (for admin filtering)
    public List<BookingResponseDto> getBookingsByStatus(BookingStatus status) {
        List<Booking> bookings = bookingRepository.findByStatus(status);
        return bookings.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Helper method to map Booking to ResponseDto
    private BookingResponseDto mapToResponseDto(Booking booking) {
        BookingResponseDto responseDto = new BookingResponseDto();
        responseDto.setId(booking.getId());
        responseDto.setResourceId(booking.getResourceId());
        responseDto.setUserId(booking.getUserId());
        responseDto.setPurpose(booking.getPurpose());
        responseDto.setStartTime(booking.getStartTime());
        responseDto.setEndTime(booking.getEndTime());
        responseDto.setExpectedAttendees(booking.getExpectedAttendees());
        responseDto.setRejectionReason(booking.getRejectionReason());
        responseDto.setStatus(booking.getStatus());
        responseDto.setCreatedAt(booking.getCreatedAt());
        responseDto.setUpdatedAt(booking.getUpdatedAt());

        // Optionally populate resource and user details
        try {
            var resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
            if (resource != null) {
                responseDto.setResourceName(resource.getName());
                responseDto.setResourceType(resource.getType().name());
                responseDto.setResourceLocation(resource.getLocation());
            }
        } catch (Exception e) {
            // Log error but don't fail the response
        }

        return responseDto;
    }
}
