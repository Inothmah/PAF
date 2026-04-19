package com.group.smartcampus.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequestDto {

    @NotBlank(message = "Content is required")
    private String content;
}
