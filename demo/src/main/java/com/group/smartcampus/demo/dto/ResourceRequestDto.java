package com.group.smartcampus.demo.dto;

import com.group.smartcampus.demo.model.AvailabilityWindow;
import com.group.smartcampus.demo.model.ResourceStatus;
import com.group.smartcampus.demo.model.ResourceType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class ResourceRequestDto {
    @NotBlank
    private String name;
    @NotNull
    private ResourceType type;
    @Min(1)
    private Integer capacity;
    @NotBlank
    private String location;
    private String description;
    private ResourceStatus status = ResourceStatus.ACTIVE;
    private List<AvailabilityWindow> availabilityWindows;
}
