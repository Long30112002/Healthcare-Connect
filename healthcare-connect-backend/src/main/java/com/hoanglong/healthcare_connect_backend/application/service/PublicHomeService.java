package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.doctor.PublicTopDoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.review.ReviewResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.ReviewMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.Review;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DoctorRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicHomeService {

    private final DoctorRepository doctorRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    public List<PublicTopDoctorResponse> getTopDoctors(int limit) {
        log.info("Lấy top {} bác sĩ cho trang chủ", limit);

        Pageable pageable = PageRequest.of(0, limit, Sort.by("id").descending());
        List<Doctor> doctors = doctorRepository.findByStatus(DoctorStatus.APPROVED, pageable)
                .getContent();

        return doctors.stream()
                .map(this::toPublicTopDoctorResponse)
                .collect(Collectors.toList());
    }

    private PublicTopDoctorResponse toPublicTopDoctorResponse(Doctor doctor) {
        Double avgRating = reviewRepository.getAverageRatingByDoctorId(doctor.getId());
        Long totalReviews = reviewRepository.countByDoctorId(doctor.getId());

        return PublicTopDoctorResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getUser().getFullName())
                .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                .experienceYears(doctor.getExperienceYears())
                .averageRating(avgRating != null ? avgRating : 0.0)
                .totalReviews(totalReviews != null ? totalReviews : 0L)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getFeaturedReviews(int limit) {
        log.info("Lấy top {} đánh giá nổi bật cho trang chủ", limit);

        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
//        List<Review> reviews = reviewRepository.findByRatingGreaterThanEqualAndDeletedFalse(4, pageable);
        Page<Review> reviews = reviewRepository.findFeaturedReviews(4, pageable);

        return reviews.stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }
}