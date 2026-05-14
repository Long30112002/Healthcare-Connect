package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.doctor.PublicDoctorDetailResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.PublicDoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.schedule.ScheduleResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.ScheduleMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.Review;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DoctorRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReviewRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicDoctorService {

    private final DoctorRepository doctorRepository;
    private final ReviewRepository reviewRepository;
    private final ScheduleRepository scheduleRepository;
    private final ScheduleMapper scheduleMapper;

    /**
     * Lấy danh sách bác sĩ public (phân trang, lọc)
     */
    @Transactional(readOnly = true)
    public Page<PublicDoctorResponse> getPublicDoctors(String keyword, UUID specialtyId, UUID hospitalId, Pageable pageable) {
        log.info("Lấy danh sách bác sĩ public - keyword: {}, specialtyId: {}, hospitalId: {}", keyword, specialtyId, hospitalId);

        // Bỏ qua sort từ client, dùng sort mặc định theo id
        Pageable safePageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize()
        );

        Page<Doctor> doctors = doctorRepository.searchPublicDoctors(
                DoctorStatus.APPROVED, keyword, specialtyId, hospitalId, safePageable);

        return doctors.map(this::toPublicDoctorResponse);
    }

    /**
     * Lấy chi tiết bác sĩ public
     */
    @Transactional(readOnly = true)
    public PublicDoctorDetailResponse getPublicDoctorDetail(UUID doctorId) {
        log.info("Lấy chi tiết bác sĩ public: {}", doctorId);

        Doctor doctor = doctorRepository.findByIdAndStatus(doctorId, DoctorStatus.APPROVED)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        // Lấy lịch làm việc tương lai (từ hôm nay trở đi)
        LocalDateTime now = LocalDateTime.now();
        List<Schedule> futureSchedules = scheduleRepository.findByDoctorIdAndStatusAndDateBetween(
                doctorId, ScheduleStatus.AVAILABLE, now, now.plusDays(30));

        List<ScheduleResponse> scheduleResponses = futureSchedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());

        Double avgRating = reviewRepository.getAverageRatingByDoctorId(doctorId);
        Long totalReviews = reviewRepository.countByDoctorIdAndDeletedFalse(doctorId);

        return PublicDoctorDetailResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getUser().getFullName())
                .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                .departmentName(doctor.getDepartment() != null ? doctor.getDepartment().getName() : null)
                .hospitalName(doctor.getHospital() != null ? doctor.getHospital().getName() : null)
                .hospitalAddress(doctor.getHospital() != null ? doctor.getHospital().getAddress() : null)
                .hospitalPhone(doctor.getHospital() != null ? doctor.getHospital().getHotline() : null)
                .hospitalEmail(doctor.getHospital() != null ? doctor.getHospital().getEmail() : null)
                .experienceYears(doctor.getExperienceYears())
                .degree(doctor.getDegree())
                .biography(doctor.getBiography())
                .consultationFee(doctor.getConsultationFee())
                .averageRating(avgRating != null ? avgRating : 0.0)
                .totalReviews(totalReviews != null ? totalReviews : 0L)
                .avatar(null)
                .schedules(scheduleResponses)
                .build();
    }

    /**
     * Chuyển đổi Doctor -> PublicDoctorResponse
     */
    private PublicDoctorResponse toPublicDoctorResponse(Doctor doctor) {
        Double avgRating = reviewRepository.getAverageRatingByDoctorId(doctor.getId());
        Long totalReviews = reviewRepository.countByDoctorIdAndDeletedFalse(doctor.getId());

        return PublicDoctorResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getUser().getFullName())
                .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                .hospitalName(doctor.getHospital() != null ? doctor.getHospital().getName() : null)
                .hospitalAddress(doctor.getHospital() != null ? doctor.getHospital().getAddress() : null)
                .experienceYears(doctor.getExperienceYears())
                .degree(doctor.getDegree())
                .consultationFee(doctor.getConsultationFee())
                .averageRating(avgRating != null ? avgRating : 0.0)
                .totalReviews(totalReviews != null ? totalReviews : 0L)
                .avatar(null)
                .build();
    }
}