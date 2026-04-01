package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
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

    @Query("SELECT COUNT(s) > 0 FROM Schedule s WHERE s.doctor.id = :doctorId " +
            "AND s.date = :date AND s.status != 'CANCELLED' " +
            "AND ((s.startTime < :end AND s.endTime > :start))")
    boolean existsByDoctorAndOverlap(UUID doctorId, LocalDate date, LocalTime start, LocalTime end);
}