package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import jakarta.persistence.LockModeType;
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
    @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
            "WHERE a.patient.id = :patientId " +
            "AND a.schedule.date = :date " +
            "AND a.schedule.startTime = :startTime " +
            "AND a.status NOT IN :excludedStatuses")
    boolean existsByPatientOverlap(
            @Param("patientId") UUID patientId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("excludedStatuses") Collection<AppointmentStatus> excludedStatuses
    );
    List<Appointment> findByPatientId(UUID patientId);

    boolean existsByPatientIdAndScheduleIdAndStatus(UUID patientId, UUID scheduleId, AppointmentStatus appointmentStatus);
    @Lock(LockModeType.PESSIMISTIC_WRITE) // Khóa dòng này lại để đợi thanh toán
    @Query("SELECT a FROM Appointment a WHERE a.id = :id")
    Optional<Appointment> findByIdWithLock(@Param("id") UUID id);
}