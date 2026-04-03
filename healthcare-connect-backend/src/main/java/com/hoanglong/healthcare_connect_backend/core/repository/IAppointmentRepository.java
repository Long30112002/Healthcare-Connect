package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IAppointmentRepository {
    Appointment save(Appointment appointment);
    Optional<Appointment> findById(UUID id);
    List<Appointment> findByPatientId(UUID patientId);
    boolean existsByPatientOverlap(UUID patientId, LocalDate date, LocalTime startTime, List<AppointmentStatus> excludedStatuses);
    boolean existsByPatientIdAndScheduleIdAndStatus(UUID patientId, UUID scheduleId, AppointmentStatus appointmentStatus);
    Optional<Appointment> findByIdWithLock(UUID id);
}
