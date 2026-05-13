package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.PublicTopDoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.review.ReviewResponse;
import com.hoanglong.healthcare_connect_backend.application.service.PublicHomeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/home")
@RequiredArgsConstructor
@Slf4j
public class PublicHomeController {

    private final PublicHomeService publicHomeService;

    @GetMapping("/top-doctors")
    @PreAuthorize("permitAll()")
    public ApiResponse<List<PublicTopDoctorResponse>> getTopDoctors(
            @RequestParam(defaultValue = "4") int limit
    ) {
        log.info("API: Lấy top {} bác sĩ cho trang chủ", limit);
        List<PublicTopDoctorResponse> doctors = publicHomeService.getTopDoctors(limit);
        return ApiResponse.<List<PublicTopDoctorResponse>>builder()
                .status("success")
                .code(200)
                .message("Lấy danh sách bác sĩ thành công!")
                .data(doctors)
                .build();
    }

    @GetMapping("/featured-reviews")
    @PreAuthorize("permitAll()")
    public ApiResponse<List<ReviewResponse>> getFeaturedReviews(
            @RequestParam(defaultValue = "6") int limit
    ) {
        log.info("API: Lấy top {} đánh giá nổi bật cho trang chủ", limit);
        List<ReviewResponse> reviews = publicHomeService.getFeaturedReviews(limit);
        return ApiResponse.<List<ReviewResponse>>builder()
                .status("success")
                .code(200)
                .message("Lấy danh sách đánh giá thành công!")
                .data(reviews)
                .build();
    }
}