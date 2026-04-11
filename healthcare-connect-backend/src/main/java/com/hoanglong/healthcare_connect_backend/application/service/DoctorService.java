package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.DoctorHistoryResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.VisitedDoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.DoctorMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.DoctorHistory;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorHistoryRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IHospitalRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DoctorService {
    IDoctorRepository doctorRepository;
    IHospitalRepository hospitalRepository;
    IUserRepository userRepository;
    IDoctorHistoryRepository doctorHistoryRepository;
    DoctorMapper doctorMapper;

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