package com.group.smartcampus.demo.repository;

import com.group.smartcampus.demo.model.TicketComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {

    // Find comments by ticket
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    // Find comments by user
    List<TicketComment> findByUserId(String userId);

    // Count comments by ticket
    long countByTicketId(String ticketId);

    // Delete all comments for a ticket
    void deleteByTicketId(String ticketId);
}
