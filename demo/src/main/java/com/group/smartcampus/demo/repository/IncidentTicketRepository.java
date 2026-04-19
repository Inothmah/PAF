package com.group.smartcampus.demo.repository;

import com.group.smartcampus.demo.model.IncidentTicket;
import com.group.smartcampus.demo.model.Priority;
import com.group.smartcampus.demo.model.TicketStatus;
import com.group.smartcampus.demo.model.TicketCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {

    // Find tickets by creator
    List<IncidentTicket> findByCreatedById(String createdById);

    // Find tickets by status
    List<IncidentTicket> findByStatus(TicketStatus status);

    // Find tickets by assigned technician
    List<IncidentTicket> findByAssignedToId(String assignedToId);

    // Find tickets by creator and status
    List<IncidentTicket> findByCreatedByIdAndStatus(String createdById, TicketStatus status);

    // Find tickets by priority
    List<IncidentTicket> findByPriority(Priority priority);

    // Find tickets by category
    List<IncidentTicket> findByCategory(TicketCategory category);

    // Find tickets by resource
    List<IncidentTicket> findByResourceId(String resourceId);

    // Find tickets assigned to a technician with specific status
    List<IncidentTicket> findByAssignedToIdAndStatus(String assignedToId, TicketStatus status);

    // Count tickets by status
    long countByStatus(TicketStatus status);

    // Count tickets by creator
    long countByCreatedById(String createdById);
}
