package com.hoanglong.healthcare_connect_backend.application.dto.review;

import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)

public class ReviewRequest {
    @NotNull(message = "APPOINTMENT_ID_REQUIRED")
    UUID appointmentId;

    @NotNull(message = "RATING_REQUIRED")
    @Min(value = 1, message = "RATING_INVALID")
    @Max(value = 5, message = "RATING_INVALID")
    Integer rating;

    @Size(max = 1000, message = "COMMENT_TOO_LONG")
    String comment;

    Boolean isAnonymous;  // Ẩn danh hay không
}