package com.hoanglong.healthcare_connect_backend.application.dto.review;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class ReviewRequest {
    @NotNull(message = "APPOINTMENT_ID_REQUIRED")
    private UUID appointmentId;

    @NotNull(message = "RATING_REQUIRED")
    @Min(value = 1, message = "RATING_INVALID")
    @Max(value = 5, message = "RATING_INVALID")
    private Integer rating;

    @Size(max = 1000, message = "COMMENT_TOO_LONG")
    private String comment;

    private Boolean isAnonymous;  // Ẩn danh hay không
}