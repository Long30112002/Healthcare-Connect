package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.review.DoctorRatingResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.review.DoctorReviewResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.review.ReviewRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.review.ReviewResponse;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.Review;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DoctorRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReviewRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.UserRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    private static final int EDIT_DAYS_LIMIT = 7; // 7 ngày được sửa

    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        log.info("Tạo đánh giá mới cho appointment: {} bởi user: {}", request.getAppointmentId(), currentUserId);

        // 1. Kiểm tra appointment tồn tại
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

        // 2. Kiểm tra appointment đã COMPLETED chưa (chỉ được đánh giá sau khi khám xong)
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new AppException(ErrorCode.APPOINTMENT_NOT_COMPLETED);
        }

        // 3. Kiểm tra người dùng có phải là patient của appointment này không
        if (appointment.getPatient() == null || !appointment.getPatient().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // 4. Kiểm tra đã đánh giá chưa (mỗi appointment chỉ đánh giá 1 lần)
        if (reviewRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        // 5. Kiểm tra thời gian đánh giá: chỉ được đánh giá trong vòng 30 ngày sau khi khám
        LocalDateTime appointmentDate = appointment.getAppointmentDate();
        LocalDateTime now = LocalDateTime.now();
        if (appointmentDate.plusDays(30).isBefore(now)) {
            throw new AppException(ErrorCode.REVIEW_EXPIRED);
        }

        // 6. Tạo review mới
        Review review = Review.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getSchedule().getDoctor())
                .rating(request.getRating())
                .comment(request.getComment())
                .isAnonymous(request.getIsAnonymous() != null && request.getIsAnonymous())
                .createdAt(LocalDateTime.now())
                .isEdited(false)
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("Đã tạo đánh giá thành công với ID: {}", savedReview.getId());

        return convertToResponse(savedReview);
    }

    @Transactional
    public ReviewResponse updateReview(UUID reviewId, ReviewRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        log.info("Cập nhật đánh giá ID: {} bởi user: {}", reviewId, currentUserId);

        // 1. Tìm review
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // 2. Kiểm tra quyền sở hữu
        if (!review.getPatient().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // 3. Kiểm tra thời gian chỉnh sửa (chỉ được sửa trong 7 ngày)
        LocalDateTime createdAt = review.getCreatedAt();
        if (createdAt.plusDays(EDIT_DAYS_LIMIT).isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.REVIEW_CANNOT_EDIT);
        }

        // 4. Cập nhật nội dung
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setEdited(true);
        review.setEditedAt(LocalDateTime.now());
        if (request.getIsAnonymous() != null) {
            review.setAnonymous(request.getIsAnonymous());
        }

        Review updatedReview = reviewRepository.save(review);
        log.info("Đã cập nhật đánh giá ID: {}", updatedReview.getId());

        return convertToResponse(updatedReview);
    }

    public ReviewResponse getReviewByAppointmentId(UUID appointmentId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Review review = reviewRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Kiểm tra quyền: chỉ patient của appointment hoặc doctor mới được xem
        Appointment appointment = review.getAppointment();
        boolean isPatient = appointment.getPatient() != null &&
                appointment.getPatient().getId().equals(currentUserId);
        boolean isDoctor = review.getDoctor().getUser().getId().equals(currentUserId);
        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");

        if (!isPatient && !isDoctor && !isAdmin) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        return convertToResponse(review);
    }

    public Page<DoctorReviewResponse> getMyReviews(int page, int size) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        log.info("Lấy danh sách đánh giá cho doctor: {}", currentUserId);

        // Lấy doctor hiện tại
        Doctor doctor = doctorRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByDoctorId(doctor.getId(), pageable);

        return reviews.map(this::convertToDoctorResponse);
    }

    public DoctorRatingResponse getMyRating() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Doctor doctor = doctorRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        return getDoctorRating(doctor.getId());
    }

    public DoctorRatingResponse getDoctorRating(UUID doctorId) {
        List<Review> reviews = reviewRepository.findAllByDoctorId(doctorId);

        if (reviews == null || reviews.isEmpty()) {
            return DoctorRatingResponse.builder()
                    .averageRating(0.0)
                    .totalReviews(0)
                    .rating1Count(0)
                    .rating2Count(0)
                    .rating3Count(0)
                    .rating4Count(0)
                    .rating5Count(0)
                    .build();
        }

        double sum = 0;
        int total = reviews.size();
        int rating1 = 0, rating2 = 0, rating3 = 0, rating4 = 0, rating5 = 0;

        for (Review review : reviews) {
            if (review.isDeleted()) continue;

            int rating = review.getRating();
            sum += rating;
            switch (rating) {
                case 1 -> rating1++;
                case 2 -> rating2++;
                case 3 -> rating3++;
                case 4 -> rating4++;
                case 5 -> rating5++;
                default -> {}
            }
        }

        // Làm tròn đến 1 chữ số thập phân
        double average = total > 0 ? Math.round((sum / total) * 10) / 10.0 : 0.0;

        return DoctorRatingResponse.builder()
                .averageRating(average)
                .totalReviews(total)
                .rating1Count(rating1)
                .rating2Count(rating2)
                .rating3Count(rating3)
                .rating4Count(rating4)
                .rating5Count(rating5)
                .build();
    }

    public Page<DoctorReviewResponse> getDoctorReviews(UUID doctorId, int page, int size) {
        // Kiểm tra doctor tồn tại
        if (!doctorRepository.existsById(doctorId)) {
            throw new AppException(ErrorCode.DOCTOR_NOT_FOUND);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByDoctorId(doctorId, pageable);

        return reviews.map(this::convertToDoctorResponse);
    }

    public List<ReviewResponse> getMyPatientReviews() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        List<Review> reviews = reviewRepository.findByPatientIdOrderByCreatedAtDesc(currentUserId);

        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public boolean hasReviewed(UUID appointmentId) {
        return reviewRepository.existsByAppointmentId(appointmentId);
    }

    @Transactional
    public void deleteReview(UUID reviewId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        String currentRole = SecurityUtils.getCurrentUserRole();

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Kiểm tra đã bị xóa chưa
        if (review.isDeleted()) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_DELETED);
        }

        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isOwner = review.getPatient().getId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Soft delete
        reviewRepository.softDeleteById(reviewId);
        log.info("Đã xóa mềm đánh giá ID: {} bởi user: {}", reviewId, currentUserId);
    }

    private ReviewResponse convertToResponse(Review review) {
        User patient = review.getPatient();
        boolean showName = !review.isAnonymous();

        return ReviewResponse.builder()
                .id(review.getId())
                .appointmentId(review.getAppointment().getId())
                .patientId(patient.getId())
                .patientName(showName ? patient.getFullName() : "Ẩn danh")
                .doctorId(review.getDoctor().getId())
                .doctorName(review.getDoctor().getUser().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .isAnonymous(review.isAnonymous())
                .isEdited(review.isEdited())
                .editedAt(review.getEditedAt())
                .createdAt(review.getCreatedAt())
                .canEdit(canEdit(review))
                .build();
    }

    private DoctorReviewResponse convertToDoctorResponse(Review review) {
        User patient = review.getPatient();
        boolean showName = !review.isAnonymous();

        return DoctorReviewResponse.builder()
                .id(review.getId())
                .appointmentId(review.getAppointment().getId())
                .patientName(showName ? patient.getFullName() : "Ẩn danh")
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    @Transactional
    public void restoreReview(UUID reviewId) {
        String currentRole = SecurityUtils.getCurrentUserRole();

        if (!"ROLE_ADMIN".equals(currentRole)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        if (!review.isDeleted()) {
            throw new AppException(ErrorCode.REVIEW_NOT_DELETED);
        }

        review.setDeleted(false);
        reviewRepository.save(review);
        log.info("Đã khôi phục đánh giá ID: {}", reviewId);
    }

    private boolean canEdit(Review review) {
        // Kiểm tra xem có còn trong thời gian chỉnh sửa không
        LocalDateTime createdAt = review.getCreatedAt();
        return createdAt.plusDays(EDIT_DAYS_LIMIT).isAfter(LocalDateTime.now());
    }
}