package com.group.smartcampus.demo.dto;

import com.group.smartcampus.demo.model.AvailabilityWindow;
import com.group.smartcampus.demo.model.ResourceStatus;
import com.group.smartcampus.demo.model.ResourceType;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ResourceResponseDto {
    private String id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private ResourceStatus status;
    private List<AvailabilityWindow> availabilityWindows;
    private LocalDateTime createdAt;
}
