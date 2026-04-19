package com.group.smartcampus.demo.controller;

import com.group.smartcampus.demo.dto.ResourceRequestDto;
import com.group.smartcampus.demo.dto.ResourceResponseDto;
import com.group.smartcampus.demo.model.ResourceType;
import com.group.smartcampus.demo.model.ResourceStatus;
import com.group.smartcampus.demo.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ResourceController {

    private final ResourceService resourceService;

    // Get all resources with optional filters
    @GetMapping
    public ResponseEntity<List<ResourceResponseDto>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String name) {
        
        List<ResourceResponseDto> resources = resourceService.searchResources(
            type != null ? ResourceType.valueOf(type.toUpperCase()) : null,
            null, // status filter - we'll add this later if needed
            location,
            name,
            minCapacity
        );
        
        return ResponseEntity.ok(resources);
    }

    // Get resource by ID
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDto> getResourceById(@PathVariable String id) {
        ResourceResponseDto resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    // Create new resource (Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDto> createResource(@Valid @RequestBody ResourceRequestDto requestDto) {
        ResourceResponseDto createdResource = resourceService.createResource(requestDto);
        return new ResponseEntity<>(createdResource, HttpStatus.CREATED);
    }

    // Update resource (Admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDto> updateResource(
            @PathVariable String id, 
            @Valid @RequestBody ResourceRequestDto requestDto) {
        ResourceResponseDto updatedResource = resourceService.updateResource(id, requestDto);
        return ResponseEntity.ok(updatedResource);
    }

    // Delete resource (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    // Get resources by type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceResponseDto>> getResourcesByType(@PathVariable ResourceType type) {
        List<ResourceResponseDto> resources = resourceService.getResourcesByType(type);
        return ResponseEntity.ok(resources);
    }

    // Get resources by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ResourceResponseDto>> getResourcesByStatus(@PathVariable ResourceStatus status) {
        List<ResourceResponseDto> resources = resourceService.getResourcesByStatus(status);
        return ResponseEntity.ok(resources);
    }

    // Get resources by location
    @GetMapping("/location/{location}")
    public ResponseEntity<List<ResourceResponseDto>> getResourcesByLocation(@PathVariable String location) {
        List<ResourceResponseDto> resources = resourceService.getResourcesByLocation(location);
        return ResponseEntity.ok(resources);
    }

    // Get resources by capacity range
    @GetMapping("/capacity")
    public ResponseEntity<List<ResourceResponseDto>> getResourcesByCapacity(
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity) {
        List<ResourceResponseDto> resources = resourceService.getResourcesByCapacity(minCapacity, maxCapacity);
        return ResponseEntity.ok(resources);
    }

    // Get resources by type and status
    @GetMapping("/type/{type}/status/{status}")
    public ResponseEntity<List<ResourceResponseDto>> getResourcesByTypeAndStatus(
            @PathVariable ResourceType type,
            @PathVariable ResourceStatus status) {
        List<ResourceResponseDto> resources = resourceService.getResourcesByTypeAndStatus(type, status);
        return ResponseEntity.ok(resources);
    }

    // Get active resources (for public catalogue)
    @GetMapping("/active")
    public ResponseEntity<List<ResourceResponseDto>> getActiveResources() {
        List<ResourceResponseDto> resources = resourceService.getActiveResources();
        return ResponseEntity.ok(resources);
    }

    // Advanced search endpoint
    @GetMapping("/search")
    public ResponseEntity<List<ResourceResponseDto>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer minCapacity) {
        
        List<ResourceResponseDto> resources = resourceService.searchResources(type, status, location, name, minCapacity);
        return ResponseEntity.ok(resources);
    }
}
