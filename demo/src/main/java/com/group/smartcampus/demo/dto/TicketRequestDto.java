package com.group.smartcampus.demo.dto;

import com.group.smartcampus.demo.model.Priority;
import com.group.smartcampus.demo.model.TicketCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequestDto {

    private String resourceId;

    private String location;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private String contactDetails;
}
