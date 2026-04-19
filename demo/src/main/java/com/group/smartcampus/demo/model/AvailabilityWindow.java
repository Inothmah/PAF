package com.group.smartcampus.demo.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
public class AvailabilityWindow {
    private String day; // e.g., "MONDAY", "TUESDAY"
    private String startTime; // "08:00"
    private String endTime; // "18:00"
}
