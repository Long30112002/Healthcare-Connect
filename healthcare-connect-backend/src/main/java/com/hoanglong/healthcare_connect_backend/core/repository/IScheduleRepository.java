package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IScheduleRepository {
    Optional<Schedule> findById(UUID id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Schedule> findByIdWithLock(UUID id);
    Schedule save(Schedule schedule);
    List<Schedule> findByDoctorIdAndDate(UUID doctorId, LocalDate date);

    List<Schedule> findAll();

    @Query(value = "SELECT COUNT(*) > 0 FROM schedules s " +
            "WHERE s.doctor_id = :doctorId " +
            "AND s.date::date = :date " +
            "AND s.status != 'CANCELLED' " +
            "AND (s.start_time::time < :endTime AND s.end_time::time > :startTime)", // Ép kiểu ::time
            nativeQuery = true)
    boolean existsOverlappingSchedule(@Param("doctorId") UUID doctorId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}