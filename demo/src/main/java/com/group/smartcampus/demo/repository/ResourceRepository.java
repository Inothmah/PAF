package com.group.smartcampus.demo.repository;

import com.group.smartcampus.demo.model.Resource;
import com.group.smartcampus.demo.model.ResourceStatus;
import com.group.smartcampus.demo.model.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    
    // Basic CRUD operations inherited from MongoRepository
    
    // Search and filtering methods
    List<Resource> findByType(ResourceType type);
    
    List<Resource> findByStatus(ResourceStatus status);
    
    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);
    
    List<Resource> findByLocationContainingIgnoreCase(String location);
    
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
    
    List<Resource> findByCapacityBetween(Integer minCapacity, Integer maxCapacity);
    
    List<Resource> findByTypeAndLocationContainingIgnoreCase(ResourceType type, String location);
    
    List<Resource> findByStatusAndLocationContainingIgnoreCase(ResourceStatus status, String location);
    
    // Complex search methods
    List<Resource> findByNameContainingIgnoreCase(String name);
    
    List<Resource> findByTypeAndNameContainingIgnoreCase(ResourceType type, String name);
    
    // Advanced filtering methods
    List<Resource> findByTypeAndStatusAndLocationContainingIgnoreCase(
        ResourceType type, 
        ResourceStatus status, 
        String location
    );
    
    List<Resource> findByCapacityGreaterThanEqualAndStatus(
        Integer capacity, 
        ResourceStatus status
    );
    
    // Combined search for catalogue
    List<Resource> findByTypeAndCapacityGreaterThanEqualAndLocationContainingIgnoreCase(
        ResourceType type, 
        Integer capacity, 
        String location
    );
}
