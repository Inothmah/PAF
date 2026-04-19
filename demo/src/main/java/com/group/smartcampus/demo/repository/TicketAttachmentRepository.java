package com.group.smartcampus.demo.repository;

import com.group.smartcampus.demo.model.TicketAttachment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketAttachmentRepository extends MongoRepository<TicketAttachment, String> {

    // Find attachments by ticket
    List<TicketAttachment> findByTicketId(String ticketId);

    // Count attachments by ticket (for max 3 validation)
    long countByTicketId(String ticketId);

    // Delete all attachments for a ticket
    void deleteByTicketId(String ticketId);
}
