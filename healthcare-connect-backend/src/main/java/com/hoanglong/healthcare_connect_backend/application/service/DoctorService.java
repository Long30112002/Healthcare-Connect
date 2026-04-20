package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.*;
import com.hoanglong.healthcare_connect_backend.application.mapper.DoctorMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.*;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DoctorService {
    DoctorRepository doctorRepository;
    HospitalRepository hospitalRepository;
    UserRepository userRepository;
    DoctorHistoryRepository doctorHistoryRepository;
    DoctorMapper doctorMapper;
    ScheduleRepository scheduleRepository;

    public List<VisitedDoctorResponse> getVisitedDoctors(UUID patientId) {
        List<AppointmentStatus> statuses = List.of(
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.COMPLETED,
                AppointmentStatus.IN_PROGRESS
        );

        List<Doctor> doctors = doctorRepository.findVisitedDoctorsByPatientId(patientId, statuses);

        return doctors.stream()
                .map(doctor -> VisitedDoctorResponse.builder()
                        .id(doctor.getId())
                        .fullName(doctor.getUser().getFullName())
                        .specialtyName(doctor.getSpecialty().getName())
                        .experienceYears(doctor.getExperienceYears())
                        .consultationFee(doctor.getConsultationFee())
                        .rating(0.0)
                        .avatar(null)
                        .build())
                .collect(Collectors.toList());
    }

    public List<DoctorListResponse> getAvailableDoctors(LocalDate date, Integer days) {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end;

        if (date != null) {
            start = date.atStartOfDay();
            end = date.atTime(23, 59, 59);
        } else if (days != null && days > 0) {
            end = start.plusDays(days);
        } else {
            end = start.plusDays(30);
        }

        System.out.println("Start: " + start);
        System.out.println("End: " + end);

        List<Doctor> doctors = doctorRepository.findAvailableDoctorsWithSchedules(
                DoctorStatus.APPROVED,
                ScheduleStatus.AVAILABLE,
                start,
                end
        );

        return doctors.stream()
                .map(this::toDoctorListResponse)
                .collect(Collectors.toList());
    }

    private DoctorListResponse toDoctorListResponse(Doctor doctor) {
        return DoctorListResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getUser().getFullName())
                .specialtyName(doctor.getSpecialty().getName())
                .hospitalName(doctor.getHospital().getName())
                .experienceYears(doctor.getExperienceYears())
                .consultationFee(doctor.getConsultationFee())
                .rating(0.0)
                .avatar(null)
                .availableSchedules(doctor.getSchedules().size())
                .build();
    }

    public DoctorDetailResponse getDoctorDetail(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next30Days = now.plusDays(300);
        List<Schedule> availableSchedules = scheduleRepository.findByDoctorIdAndStatusAndDateBetween(
                doctorId, ScheduleStatus.AVAILABLE, now, next30Days
        );

        return DoctorDetailResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getUser().getFullName())
                .specialtyName(doctor.getSpecialty().getName())
                .hospitalName(doctor.getHospital().getName())
                .address(doctor.getHospital().getAddress())
                .experienceYears(doctor.getExperienceYears())
                .degree(doctor.getDegree())
                .biography(doctor.getBiography())
                .consultationFee(doctor.getConsultationFee())
                .rating(0.0)
                .avatar(null)
                .schedules(availableSchedules.stream()
                        .map(s -> ScheduleResponse.builder()
                                .id(s.getId())
                                .date(s.getDate())
                                .startTime(s.getStartTime())
                                .endTime(s.getEndTime())
                                .price(s.getPrice())
                                .currentBookings(s.getCurrentBookings())
                                .maxPatients(s.getMaxPatients())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    public DoctorResponse getPublicDoctorById(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        if (doctor.getStatus() != DoctorStatus.APPROVED) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }

        return doctorMapper.toDoctorResponse(doctor);
    }

    public DoctorResponse getDoctorForAdmin(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));
        return doctorMapper.toDoctorResponse(doctor);
    }

    public DoctorResponse getDoctorForManager(UUID id, UUID managerId) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        if (doctor.getHospital() == null ||
                doctor.getHospital().getManager() == null ||
                !doctor.getHospital().getManager().getId().equals(managerId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        return doctorMapper.toDoctorResponse(doctor);
    }

    public List<DoctorResponse> getAllDoctorsByManager(UUID managerId) {
        Hospital hospital = hospitalRepository.findByManagerId(managerId)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));

        return doctorRepository.findAllByHospitalId(hospital.getId())
                .stream()
                .map(doctorMapper::toDoctorResponse)
                .collect(Collectors.toList());
    }

    public DoctorResponse getDoctorProfileForSelf(UUID id, UUID currentUserId) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        if (!doctor.getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        return doctorMapper.toDoctorResponse(doctor);
    }

    public List<DoctorResponse> getVerifiedDoctorsByManager(UUID managerId) {
        Hospital hospital = hospitalRepository.findByManagerId(managerId)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));

        return doctorRepository.findAllByHospitalIdAndStatus(hospital.getId(), DoctorStatus.VERIFIED)
                .stream()
                .map(doctorMapper::toDoctorResponse)
                .collect(Collectors.toList());
    }

    public List<DoctorHistoryResponse> getDoctorHistory(UUID doctorId) {
        return doctorHistoryRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(this::toHistoryResponse)
                .collect(Collectors.toList());
    }

    private DoctorHistoryResponse toHistoryResponse(DoctorHistory history) {
        String actorName = userRepository.findById(history.getActorId())
                .map(User ::getFullName)
                .orElse("Unknown");

        return DoctorHistoryResponse.builder()
                .id(history.getId())
                .doctorId(history.getDoctorId())
                .actorName(actorName)
                .actorRole(history.getActorRole())
                .action(history.getAction())
                .oldStatus(history.getOldStatus())
                .newStatus(history.getNewStatus())
                .rejectionReason(history.getRejectionReason())
                .rejectionNote(history.getRejectionNote())
                .note(history.getNote())
                .createdAt(history.getCreatedAt())
                .build();
    }

    public Optional<Doctor> getDoctorEntityByUserId(UUID userId) {
        return doctorRepository.findByUserId(userId);
    }
}