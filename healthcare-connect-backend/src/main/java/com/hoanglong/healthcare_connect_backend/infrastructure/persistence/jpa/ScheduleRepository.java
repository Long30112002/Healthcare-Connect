package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Schedule s WHERE s.id = :id")
    Optional<Schedule> findByIdWithLock(UUID id);

    List<Schedule> findByDoctorIdAndDate(UUID doctorId, LocalDate date);
    List<Schedule> findByDoctorIdAndStatusAndDateBetween(UUID doctorId, ScheduleStatus status, LocalDateTime startDate, LocalDateTime endDate);

    @Query(value = "SELECT COUNT(*) > 0 FROM schedules s " +
            "WHERE s.doctor_id = :doctorId " +
            "AND s.date::date = :date " +
            "AND s.status != 'CANCELLED' " +
            "AND (s.start_time::time < :endTime AND s.end_time::time > :startTime)", 
            nativeQuery = true)
    boolean existsOverlappingSchedule(@Param("doctorId") UUID doctorId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    Page<Schedule> findByDoctorId(UUID doctorId, Pageable pageable);

    Page<Schedule> findByDoctorIdAndStatus(UUID doctorId, ScheduleStatus status, Pageable pageable);

    @Query("SELECT s FROM Schedule s " +
            "WHERE s.doctor.id = :doctorId " +
            "AND s.date BETWEEN :startDate AND :endDate " +
            "ORDER BY s.date ASC, s.startTime ASC")
    Page<Schedule> findByDoctorIdAndDateBetween(@Param("doctorId") UUID doctorId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT s FROM Schedule s " +
            "WHERE s.doctor.id = :doctorId " +
            "AND s.status = :status " +
            "AND s.startTime > :now " +
            "ORDER BY s.date ASC, s.startTime ASC")
    List<Schedule> findAvailableSchedulesByDoctorId(@Param("doctorId") UUID doctorId,
            @Param("status") ScheduleStatus status,
            @Param("now") LocalDateTime now);

    long countByDoctorIdAndDateBetween(UUID doctorId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
            "FROM Appointment a WHERE a.schedule.id = :scheduleId")
    boolean hasBookings(@Param("scheduleId") UUID scheduleId);

    @Modifying
    @Query(value = "UPDATE schedules SET status = 'EXPIRED' " +
            "WHERE status IN ('AVAILABLE', 'FULL') " +
            "AND end_time < :now",
            nativeQuery = true)
    int updateExpiredSchedules(@Param("now") LocalDateTime now);

    @Query(value = "SELECT COUNT(*) > 0 FROM schedules s " +
            "WHERE s.doctor_id = :doctorId " +
            "AND s.id != :scheduleId " +
            "AND s.date::date = :date " +
            "AND s.status != 'CANCELLED' " +
            "AND (s.start_time::time < :endTime AND s.end_time::time > :startTime)",
            nativeQuery = true)
    boolean existsOverlappingScheduleExcludeSelf(
            @Param("doctorId") UUID doctorId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("scheduleId") UUID scheduleId
    );
}