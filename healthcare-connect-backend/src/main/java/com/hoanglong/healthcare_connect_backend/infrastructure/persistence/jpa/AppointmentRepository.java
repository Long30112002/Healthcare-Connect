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
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID>
{
    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.schedule s
        JOIN FETCH s.doctor d
        JOIN FETCH d.user u
        WHERE a.id = :id
    """)
    Optional<Appointment> findByIdWithDetails(@Param("id") UUID id);

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

    @Query("SELECT a FROM Appointment a " +
            "JOIN a.schedule s " +
            "WHERE s.doctor.id = :doctorId " +
            "ORDER BY a.appointmentDate ASC")
    Page<Appointment> findByScheduleDoctorId(@Param("doctorId") UUID doctorId, Pageable pageable);

    @Query("SELECT a FROM Appointment a " +
            "JOIN a.schedule s " +
            "WHERE s.doctor.id = :doctorId " +
            "AND a.status = :status " +
            "ORDER BY a.appointmentDate ASC")
    Page<Appointment> findByScheduleDoctorIdAndStatus(@Param("doctorId") UUID doctorId,
            @Param("status") AppointmentStatus status,
            Pageable pageable);

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient p " +
            "JOIN FETCH a.schedule s " +
            "JOIN FETCH s.doctor d " +
            "WHERE a.appointmentDate BETWEEN :start AND :end " +
            "ORDER BY a.appointmentDate ASC")
    List<Appointment> findByAppointmentDateBetween(@Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT DISTINCT a FROM Appointment a " +
            "JOIN FETCH a.patient p " +
            "JOIN FETCH a.schedule s " +
            "JOIN FETCH s.doctor d " +
            "WHERE LOWER(p.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR p.phone LIKE CONCAT('%', :keyword, '%') " +
            "OR CAST(a.id AS string) LIKE CONCAT('%', :keyword, '%')")
    List<Appointment> searchAppointments(@Param("keyword") String keyword);

    List<Appointment> findByScheduleStartTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE DATE(a.schedule.date) = :date")
    Page<Appointment> findByScheduleDate(@Param("date") LocalDate date, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE DATE(a.schedule.date) BETWEEN :start AND :end")
    Page<Appointment> findByScheduleDateBetween(@Param("start") LocalDate start,
            @Param("end") LocalDate end,
            Pageable pageable);

    @Query("SELECT a FROM Appointment a ORDER BY a.schedule.date ASC")
    Page<Appointment> findAllByOrderByScheduleDateAsc(Pageable pageable);
}