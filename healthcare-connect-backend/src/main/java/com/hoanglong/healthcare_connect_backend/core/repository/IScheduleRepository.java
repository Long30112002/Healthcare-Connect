package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IScheduleRepository {
    Optional<Schedule> findById(UUID id);
    Optional<Schedule> findByIdWithLock(UUID id);
    Schedule save(Schedule schedule);
    List<Schedule> findByDoctorIdAndDate(UUID doctorId, LocalDate date);
    boolean existsByDoctorAndOverlap(UUID doctorId, LocalDate date, LocalTime start, LocalTime end);
}