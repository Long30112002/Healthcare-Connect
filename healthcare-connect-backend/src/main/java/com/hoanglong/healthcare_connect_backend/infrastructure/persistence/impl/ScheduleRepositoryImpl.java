package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;

import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.repository.IScheduleRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ScheduleRepositoryImpl implements IScheduleRepository {
    private final JpaScheduleRepository jpaScheduleRepository;

    @Override
    public Optional<Schedule> findById(UUID id) {
        return jpaScheduleRepository.findById(id);
    }

    @Override
    public Optional<Schedule> findByIdWithLock(UUID id) {
        return jpaScheduleRepository.findByIdWithLock(id);
    }

    @Override
    public Schedule save(Schedule schedule) {
        return jpaScheduleRepository.save(schedule);
    }

    @Override
    public List<Schedule> findByDoctorIdAndDate(UUID doctorId, LocalDate date) {
        return jpaScheduleRepository.findByDoctorIdAndDate(doctorId, date);
    }

    @Override
    public boolean existsByDoctorAndOverlap(UUID doctorId, LocalDate date, LocalTime start, LocalTime end) {
        return jpaScheduleRepository.existsByDoctorAndOverlap(doctorId, date, start, end);
    }
}
