package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.appointment.WalkInAppointmentDto;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.*;
import com.hoanglong.healthcare_connect_backend.application.dto.patient.PatientResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.schedule.ScheduleResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.DoctorMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.*;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.*;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final DoctorHistoryRepository doctorHistoryRepository;
    private final DoctorMapper doctorMapper;
    private final ScheduleRepository scheduleRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ReviewRepository reviewRepository;

    public Doctor getDoctorById(UUID doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));
    }

    public DoctorResponse getMyInfo() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Doctor doctor = doctorRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));
        return doctorMapper.toDoctorResponse(doctor);
    }

    public List<Map<String, Object>> getAllMyPatients() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Doctor doctor = doctorRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        List<Object[]> results = appointmentRepository.findAllAppointmentsByDoctor(doctor.getId());

        // Gom nhóm theo patientId hoặc phone
        Map<String, Map<String, Object>> patientMap = new LinkedHashMap<>();

        for (Object[] row : results) {
            UUID patientId = (UUID) row[0];
            UUID appointmentId = (UUID) row[1];
            String patientName = (String) row[2];
            String patientPhone = (String) row[3];
            String patientEmail = (String) row[4];
            LocalDateTime visitDate = (LocalDateTime) row[5];
            String diagnosis = (String) row[6];

            String key = patientId != null ? patientId.toString() : patientPhone;

            if (!patientMap.containsKey(key)) {
                Map<String, Object> patient = new HashMap<>();
                patient.put("id", patientId != null ? patientId : appointmentId);
                patient.put("patientId", patientId);
                patient.put("patientName", patientName);
                patient.put("patientPhone", patientPhone);
                patient.put("patientEmail", patientEmail);
                patient.put("lastVisitDate", visitDate);
                patient.put("lastDiagnosis", diagnosis);
                patient.put("totalVisits", 1);
                patient.put("isWalkIn", patientId == null);
                patientMap.put(key, patient);
            } else {
                Map<String, Object> existing = patientMap.get(key);
                existing.put("totalVisits", (Integer) existing.get("totalVisits") + 1);
                // Cập nhật lastVisitDate nếu mới hơn
                LocalDateTime existingDate = (LocalDateTime) existing.get("lastVisitDate");
                if (visitDate != null && (existingDate == null || visitDate.isAfter(existingDate))) {
                    existing.put("lastVisitDate", visitDate);
                    existing.put("lastDiagnosis", diagnosis);
                }
            }
        }

        return new ArrayList<>(patientMap.values());
    }

    public DoctorDetailResponse getDoctorDetailForReceptionist(UUID doctorId, UUID hospitalId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        if (!doctor.getHospital().getId().equals(hospitalId)) {
            throw new AppException(ErrorCode.DOCTOR_NOT_IN_HOSPITAL);
        }

        return getDoctorDetail(doctorId);
    }

    public List<VisitedDoctorResponse> getVisitedDoctors(UUID patientId) {
        List<AppointmentStatus> statuses = List.of(
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.COMPLETED,
                AppointmentStatus.IN_PROGRESS
        );

        List<Doctor> doctors = doctorRepository.findVisitedDoctorsByPatientId(patientId, statuses);

        if (doctors.isEmpty()) {
            return new ArrayList<>();
        }

        List<UUID> doctorIds = doctors.stream()
                .map(Doctor::getId)
                .collect(Collectors.toList());

        List<Object[]> ratings = reviewRepository.getAverageRatingsByDoctorIds(doctorIds);
        Map<UUID, Double> ratingMap = ratings.stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> row[1] != null ? (Double) row[1] : 0.0,
                        (existing, replacement) -> existing
                ));

        return doctors.stream()
                .map(doctor -> VisitedDoctorResponse.builder()
                        .id(doctor.getId())
                        .fullName(doctor.getUser().getFullName())
                        .specialtyName(doctor.getSpecialty().getName())
                        .experienceYears(doctor.getExperienceYears())
                        .consultationFee(doctor.getConsultationFee())
                        .rating(ratingMap.getOrDefault(doctor.getId(), 0.0))
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
        Double averageRating = getAverageRating(doctor.getId());

        return DoctorListResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getUser().getFullName())
                .specialtyName(doctor.getSpecialty().getName())
                .hospitalName(doctor.getHospital().getName())
                .experienceYears(doctor.getExperienceYears())
                .consultationFee(doctor.getConsultationFee())
                .rating(averageRating != null ? averageRating : 0.0)
                .avatar(null)
                .availableSchedules(doctor.getSchedules().size())
                .build();
    }

    private Double getAverageRating(UUID doctorId) {
        return reviewRepository.getAverageRatingByDoctorId(doctorId);
    }


    public DoctorDetailResponse getDoctorDetail(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next30Days = now.plusDays(300);
        List<Schedule> availableSchedules = scheduleRepository.findByDoctorIdAndStatusAndDateBetween(
                doctorId, ScheduleStatus.AVAILABLE, now, next30Days
        );

        Double averageRating = getAverageRating(doctorId);

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
                .rating(averageRating != null ? averageRating : 0.0)
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

    public List<WalkInAppointmentDto> getWalkInAppointments(String phone) {
        List<Appointment> appointments = appointmentRepository.findByPatientPhone(phone);

        return appointments.stream()
                .map(apt -> {
                    boolean hasMedicalRecord = medicalRecordRepository.existsByAppointmentId(apt.getId());
                    return WalkInAppointmentDto.builder()
                            .id(apt.getId())
                            .patientName(apt.getPatientName())
                            .patientPhone(apt.getPatientPhone())
                            .appointmentDate(apt.getAppointmentDate())
                            .doctorName(apt.getSchedule().getDoctor().getUser().getFullName())
                            .doctorId(apt.getSchedule().getDoctor().getId())
                            .symptoms(apt.getSymptoms())
                            .hasMedicalRecord(hasMedicalRecord)
                            .build();
                })
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

    public List<DoctorListResponse> getAvailableDoctorsByHospital(LocalDate date, Integer days, UUID hospitalId) {
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

        List<Doctor> doctors = doctorRepository.findAvailableDoctorsByHospital(
                DoctorStatus.APPROVED,
                ScheduleStatus.AVAILABLE,
                start,
                end,
                hospitalId
        );

        return doctors.stream()
                .map(this::toDoctorListResponse)
                .collect(Collectors.toList());
    }
}