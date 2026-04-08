package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaScheduleRepository extends JpaRepository<Schedule, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Schedule s WHERE s.id = :id")
    Optional<Schedule> findByIdWithLock(UUID id);

    List<Schedule> findByDoctorIdAndDate(UUID doctorId, LocalDate date);


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
}