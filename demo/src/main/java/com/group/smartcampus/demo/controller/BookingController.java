package com.group.smartcampus.demo.controller;

import com.group.smartcampus.demo.dto.BookingRequestDto;
import com.group.smartcampus.demo.dto.BookingResponseDto;
import com.group.smartcampus.demo.model.BookingStatus;
import com.group.smartcampus.demo.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // Create new booking request (authenticated users)
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<BookingResponseDto> createBooking(
            @Valid @RequestBody BookingRequestDto requestDto) {
        
        // Get current user ID from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        try {
            BookingResponseDto createdBooking = bookingService.createBooking(requestDto, userId);
            return new ResponseEntity<>(createdBooking, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get current user's bookings
    @GetMapping("/my")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<List<BookingResponseDto>> getUserBookings() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        List<BookingResponseDto> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    // Get all bookings (admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDto>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        
        if (status != null) {
            List<BookingResponseDto> bookings = bookingService.getBookingsByStatus(status);
            return ResponseEntity.ok(bookings);
        } else {
            List<BookingResponseDto> bookings = bookingService.getAllBookings();
            return ResponseEntity.ok(bookings);
        }
    }

    // Get booking by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<BookingResponseDto> getBookingById(@PathVariable String id) {
        try {
            BookingResponseDto booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Approve booking (admin only)
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDto> approveBooking(@PathVariable String id) {
        try {
            BookingResponseDto approvedBooking = bookingService.approveBooking(id);
            return ResponseEntity.ok(approvedBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Reject booking (admin only)
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDto> rejectBooking(
            @PathVariable String id,
            @RequestBody(required = false) String rejectionReason) {
        
        try {
            BookingResponseDto rejectedBooking = bookingService.rejectBooking(id, rejectionReason);
            return ResponseEntity.ok(rejectedBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Cancel booking
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<BookingResponseDto> cancelBooking(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        try {
            BookingResponseDto cancelledBooking = bookingService.cancelBooking(id, userId);
            return ResponseEntity.ok(cancelledBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get pending bookings (admin only)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDto>> getPendingBookings() {
        List<BookingResponseDto> pendingBookings = bookingService.getPendingBookings();
        return ResponseEntity.ok(pendingBookings);
    }

    // Get bookings by status (admin only)
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDto>> getBookingsByStatus(@PathVariable BookingStatus status) {
        List<BookingResponseDto> bookings = bookingService.getBookingsByStatus(status);
        return ResponseEntity.ok(bookings);
    }
}
