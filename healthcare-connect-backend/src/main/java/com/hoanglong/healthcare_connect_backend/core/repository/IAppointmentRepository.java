//package com.hoanglong.healthcare_connect_backend.core.repository;
//
//import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
//import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//public interface IAppointmentRepository {
//    Appointment save(Appointment appointment);
//    Optional<Appointment> findById(UUID id);
//    Page<Appointment> findAllByPatientId(UUID patientId, Pageable pageable);
//    boolean existsByPatientOverlap(UUID patientId, String date, String startTime, List<String> excludedStatuses);
//    boolean existsByPatientIdAndScheduleIdAndStatusNot(UUID patientId, UUID scheduleId, AppointmentStatus appointmentStatus);
//    Optional<Appointment> findByIdWithLock(UUID id);
//    Page<Appointment> findByScheduleDoctorId(UUID doctorId, Pageable pageable);
//    Page<Appointment> findByScheduleDoctorIdAndStatus(UUID doctorId, AppointmentStatus status, Pageable pageable);
//    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);
//    List<Appointment> searchAppointments(String keyword);
//    Optional<Appointment> findByIdWithDetails(UUID appointmentId);
//}
