package com.hoanglong.healthcare_connect_backend.application.dto.review;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorRatingResponse {
    private Double averageRating;     // Rating trung bình (làm tròn 1 số)
    private Integer totalReviews;     // Tổng số đánh giá
    private Integer rating1Count;     // Số đánh giá 1 sao
    private Integer rating2Count;     // Số đánh giá 2 sao
    private Integer rating3Count;     // Số đánh giá 3 sao
    private Integer rating4Count;     // Số đánh giá 4 sao
    private Integer rating5Count;     // Số đánh giá 5 sao
}