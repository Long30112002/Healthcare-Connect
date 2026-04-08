package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaAppointmentRepository extends JpaRepository<Appointment, UUID>
{
    @Query(value = "SELECT COUNT(*) > 0 FROM appointments a " +
            "JOIN schedules s ON a.schedule_id = s.id " +
            "WHERE a.patient_id = :patientId " +
            "AND s.date::date = CAST(:date AS date) " +
            "AND s.start_time::time = CAST(:startTime AS time) " +
            "AND a.status NOT IN (:excludedStatuses)",
            nativeQuery = true)
    boolean existsByPatientOverlap(
            @Param("patientId") UUID patientId,
            @Param("date") String date,
            @Param("startTime") String startTime,
            @Param("excludedStatuses") Collection<String> excludedStatuses
    );

    boolean existsByPatientIdAndScheduleIdAndStatusNot(UUID patientId, UUID scheduleId, AppointmentStatus appointmentStatus);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Appointment a WHERE a.id = :id")
    Optional<Appointment> findByIdWithLock(@Param("id") UUID id);

    Page<Appointment> findAllByPatientId(UUID patientId, Pageable pageable);
}