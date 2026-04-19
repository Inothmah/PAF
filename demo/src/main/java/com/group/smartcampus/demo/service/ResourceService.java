package com.group.smartcampus.demo.service;

import com.group.smartcampus.demo.dto.ResourceRequestDto;
import com.group.smartcampus.demo.dto.ResourceResponseDto;
import com.group.smartcampus.demo.model.Resource;
import com.group.smartcampus.demo.model.ResourceStatus;
import com.group.smartcampus.demo.model.ResourceType;
import com.group.smartcampus.demo.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // Create new resource
    public ResourceResponseDto createResource(ResourceRequestDto requestDto) {
        Resource resource = new Resource();
        resource.setName(requestDto.getName());
        resource.setType(requestDto.getType());
        resource.setCapacity(requestDto.getCapacity());
        resource.setLocation(requestDto.getLocation());
        resource.setDescription(requestDto.getDescription());
        resource.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : ResourceStatus.ACTIVE);
        resource.setAvailabilityWindows(requestDto.getAvailabilityWindows());
        resource.setCreatedAt(LocalDateTime.now());

        Resource savedResource = resourceRepository.save(resource);
        return mapToResponseDto(savedResource);
    }

    // Get all resources
    public List<ResourceResponseDto> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Get resource by ID
    public ResourceResponseDto getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        return mapToResponseDto(resource);
    }

    // Update resource
    public ResourceResponseDto updateResource(String id, ResourceRequestDto requestDto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));

        if (requestDto.getName() != null) {
            resource.setName(requestDto.getName());
        }
        if (requestDto.getType() != null) {
            resource.setType(requestDto.getType());
        }
        if (requestDto.getCapacity() != null) {
            resource.setCapacity(requestDto.getCapacity());
        }
        if (requestDto.getLocation() != null) {
            resource.setLocation(requestDto.getLocation());
        }
        if (requestDto.getDescription() != null) {
            resource.setDescription(requestDto.getDescription());
        }
        if (requestDto.getStatus() != null) {
            resource.setStatus(requestDto.getStatus());
        }
        if (requestDto.getAvailabilityWindows() != null) {
            resource.setAvailabilityWindows(requestDto.getAvailabilityWindows());
        }

        Resource updatedResource = resourceRepository.save(resource);
        return mapToResponseDto(updatedResource);
    }

    // Delete resource
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    // Search and filtering methods
    public List<ResourceResponseDto> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<ResourceResponseDto> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<ResourceResponseDto> getResourcesByTypeAndStatus(ResourceType type, ResourceStatus status) {
        return resourceRepository.findByTypeAndStatus(type, status).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<ResourceResponseDto> getResourcesByLocation(String location) {
        return resourceRepository.findByLocationContainingIgnoreCase(location).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<ResourceResponseDto> getResourcesByCapacity(Integer minCapacity, Integer maxCapacity) {
        return resourceRepository.findByCapacityBetween(minCapacity, maxCapacity).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<ResourceResponseDto> getResourcesByCapacityGreaterThanEqual(Integer capacity) {
        return resourceRepository.findByCapacityGreaterThanEqual(capacity).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<ResourceResponseDto> getResourcesByTypeAndLocation(ResourceType type, String location) {
        return resourceRepository.findByTypeAndLocationContainingIgnoreCase(type, location).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<ResourceResponseDto> getResourcesByStatusAndLocation(ResourceStatus status, String location) {
        return resourceRepository.findByStatusAndLocationContainingIgnoreCase(status, location).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<ResourceResponseDto> getResourcesByName(String name) {
        return resourceRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<ResourceResponseDto> getResourcesByTypeAndName(ResourceType type, String name) {
        return resourceRepository.findByTypeAndNameContainingIgnoreCase(type, name).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Advanced search methods
    public List<ResourceResponseDto> searchResources(ResourceType type, ResourceStatus status, String location, String name, Integer minCapacity) {
        List<Resource> resources;

        if (type != null && status != null && location != null) {
            resources = resourceRepository.findByTypeAndStatusAndLocationContainingIgnoreCase(type, status, location);
        } else if (type != null && location != null) {
            resources = resourceRepository.findByTypeAndLocationContainingIgnoreCase(type, location);
        } else if (status != null && location != null) {
            resources = resourceRepository.findByStatusAndLocationContainingIgnoreCase(status, location);
        } else if (type != null) {
            resources = resourceRepository.findByType(type);
        } else if (status != null) {
            resources = resourceRepository.findByStatus(status);
        } else if (location != null) {
            resources = resourceRepository.findByLocationContainingIgnoreCase(location);
        } else {
            resources = resourceRepository.findAll();
        }

        // Apply additional filters
        List<Resource> filteredResources = resources.stream()
                .filter(resource -> name == null || resource.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(resource -> minCapacity == null || resource.getCapacity() >= minCapacity)
                .collect(Collectors.toList());

        return filteredResources.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Get active resources (for catalogue display)
    public List<ResourceResponseDto> getActiveResources() {
        return resourceRepository.findByStatus(ResourceStatus.ACTIVE).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Helper method to map Resource to ResponseDto
    private ResourceResponseDto mapToResponseDto(Resource resource) {
        ResourceResponseDto responseDto = new ResourceResponseDto();
        responseDto.setId(resource.getId());
        responseDto.setName(resource.getName());
        responseDto.setType(resource.getType());
        responseDto.setCapacity(resource.getCapacity());
        responseDto.setLocation(resource.getLocation());
        responseDto.setDescription(resource.getDescription());
        responseDto.setStatus(resource.getStatus());
        responseDto.setAvailabilityWindows(resource.getAvailabilityWindows());
        responseDto.setCreatedAt(resource.getCreatedAt());
        return responseDto;
    }
}
