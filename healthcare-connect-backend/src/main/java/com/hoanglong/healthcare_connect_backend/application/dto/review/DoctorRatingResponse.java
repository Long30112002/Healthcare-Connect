package com.hoanglong.healthcare_connect_backend.application.dto.review;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorRatingResponse {
    Double averageRating;     // Rating trung bình (làm tròn 1 số)
    Integer totalReviews;     // Tổng số đánh giá
    Integer rating1Count;     // Số đánh giá 1 sao
    Integer rating2Count;     // Số đánh giá 2 sao
    Integer rating3Count;     // Số đánh giá 3 sao
    Integer rating4Count;     // Số đánh giá 4 sao
    Integer rating5Count;     // Số đánh giá 5 sao
}