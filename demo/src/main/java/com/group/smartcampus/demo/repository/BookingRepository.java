package com.group.smartcampus.demo.repository;

import com.group.smartcampus.demo.model.Booking;
import com.group.smartcampus.demo.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    // Find bookings by user
    List<Booking> findByUserId(String userId);
    
    // Find bookings by user and status
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);
    
    // Find bookings by resource
    List<Booking> findByResourceId(String resourceId);
    
    // Find bookings by resource and status
    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);
    
    // Find approved bookings for a resource in a time range (for conflict checking)
    List<Booking> findByResourceIdAndStatusAndStartTimeBetween(
        String resourceId, 
        BookingStatus status, 
        LocalDateTime startTime, 
        LocalDateTime endTime
    );
    
    // Find approved bookings that overlap with the given time range
    @Query("{ 'resourceId': ?0, 'status': ?1, '$or': [ " +
           "{ 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }, " +
           "{ 'startTime': { $lt: ?3, $gte: ?2 } }, " +
           "{ 'endTime': { $gt: ?2, $lte: ?3 } }, " +
           "{ 'startTime': { $lte: ?2 }, 'endTime': { $gte: ?3 } } ] }")
    List<Booking> findOverlappingBookings(String resourceId, BookingStatus status, 
                                         LocalDateTime startTime, LocalDateTime endTime);
    
    // Find all pending bookings (for admin review)
    List<Booking> findByStatus(BookingStatus status);
    
    // Find bookings by status with pagination
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
    
        
    // Find bookings by user in a time range
    List<Booking> findByUserIdAndStartTimeBetween(
        String userId, 
        LocalDateTime startTime, 
        LocalDateTime endTime
    );
    
    // Count bookings by status
    long countByStatus(BookingStatus status);
    
    // Count bookings by user and status
    long countByUserIdAndStatus(String userId, BookingStatus status);
}
