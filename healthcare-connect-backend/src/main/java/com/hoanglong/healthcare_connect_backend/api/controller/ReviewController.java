package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.review.DoctorRatingResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.review.DoctorReviewResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.review.ReviewRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.review.ReviewResponse;
import com.hoanglong.healthcare_connect_backend.application.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<ReviewResponse> createReview(@Valid @RequestBody ReviewRequest request) {
        log.info("API: Tạo đánh giá mới cho appointment: {}", request.getAppointmentId());

        ReviewResponse response = reviewService.createReview(request);

        return ApiResponse.<ReviewResponse>builder()
                .status("success")
                .code(HttpStatus.CREATED.value())
                .message("Đánh giá của bạn đã được gửi thành công!")
                .data(response)
                .build();
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<ReviewResponse> updateReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReviewRequest request) {
        log.info("API: Cập nhật đánh giá ID: {}", reviewId);

        ReviewResponse response = reviewService.updateReview(reviewId, request);

        return ApiResponse.<ReviewResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Đã cập nhật đánh giá thành công!")
                .data(response)
                .build();
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<ReviewResponse> getReviewByAppointmentId(@PathVariable UUID appointmentId) {
        log.info("API: Lấy đánh giá theo appointment: {}", appointmentId);

        ReviewResponse response = reviewService.getReviewByAppointmentId(appointmentId);

        return ApiResponse.<ReviewResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy đánh giá thành công!")
                .data(response)
                .build();
    }

    @GetMapping("/appointment/{appointmentId}/exists")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<Boolean> hasReviewed(@PathVariable UUID appointmentId) {
        log.info("API: Kiểm tra đã đánh giá appointment: {}", appointmentId);

        boolean hasReviewed = reviewService.hasReviewed(appointmentId);

        return ApiResponse.<Boolean>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message(hasReviewed ? "Đã đánh giá" : "Chưa đánh giá")
                .data(hasReviewed)
                .build();
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<List<ReviewResponse>> getMyPatientReviews() {
        log.info("API: Lấy danh sách đánh giá của bệnh nhân hiện tại");

        List<ReviewResponse> responses = reviewService.getMyPatientReviews();

        return ApiResponse.<List<ReviewResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách đánh giá thành công!")
                .data(responses)
                .build();
    }

    @GetMapping("/doctor/my-reviews")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<Page<DoctorReviewResponse>> getMyReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("API: Lấy danh sách đánh giá của bác sĩ hiện tại");

        Page<DoctorReviewResponse> responses = reviewService.getMyReviews(page, size);

        return ApiResponse.<Page<DoctorReviewResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách đánh giá thành công!")
                .data(responses)
                .build();
    }

    @GetMapping("/doctor/my-rating")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<DoctorRatingResponse> getMyRating() {
        log.info("API: Lấy rating tổng hợp của bác sĩ hiện tại");

        DoctorRatingResponse response = reviewService.getMyRating();

        return ApiResponse.<DoctorRatingResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy rating thành công!")
                .data(response)
                .build();
    }


    @GetMapping("/doctor/{doctorId}/rating")
    @PreAuthorize("permitAll()")
    public ApiResponse<DoctorRatingResponse> getDoctorRating(@PathVariable UUID doctorId) {
        log.info("API: Lấy rating tổng hợp của bác sĩ ID: {}", doctorId);

        DoctorRatingResponse response = reviewService.getDoctorRating(doctorId);

        return ApiResponse.<DoctorRatingResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy rating thành công!")
                .data(response)
                .build();
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("permitAll()")
    public ApiResponse<Page<DoctorReviewResponse>> getDoctorReviews(
            @PathVariable UUID doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("API: Lấy danh sách đánh giá của bác sĩ ID: {}", doctorId);

        Page<DoctorReviewResponse> responses = reviewService.getDoctorReviews(doctorId, page, size);

        return ApiResponse.<Page<DoctorReviewResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách đánh giá thành công!")
                .data(responses)
                .build();
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ApiResponse<Void> deleteReview(@PathVariable UUID reviewId) {
        log.info("API: Xóa đánh giá ID: {}", reviewId);

        reviewService.deleteReview(reviewId);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Xóa đánh giá thành công!")
                .build();
    }

    @PatchMapping("/{reviewId}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> restoreReview(@PathVariable UUID reviewId) {
        log.info("API: Khôi phục đánh giá ID: {}", reviewId);

        reviewService.restoreReview(reviewId);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Khôi phục đánh giá thành công!")
                .build();
    }
}