package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;

import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.repository.IAppointmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaAppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AppointmentRepositoryImpl implements IAppointmentRepository
{
    private final JpaAppointmentRepository jpaAppointmentRepository;

    @Override
    public Appointment save(Appointment appointment) {
        return jpaAppointmentRepository.save(appointment);
    }

    @Override
    public Optional<Appointment> findById(UUID id) {
        return jpaAppointmentRepository.findById(id);
    }

    @Override
    public Page<Appointment> findAllByPatientId(UUID patientId, Pageable pageable) {
        return jpaAppointmentRepository.findAllByPatientId(patientId, pageable);
    }

    @Override
    public boolean existsByPatientOverlap(UUID patientId, String date, String startTime, List<String> excludedStatuses) {
        return jpaAppointmentRepository.existsByPatientOverlap(patientId, date, startTime, excludedStatuses);
    }

    @Override
    public boolean existsByPatientIdAndScheduleIdAndStatusNot(UUID patientId, UUID scheduleId, AppointmentStatus appointmentStatus) {
        return jpaAppointmentRepository.existsByPatientIdAndScheduleIdAndStatusNot(patientId, scheduleId, appointmentStatus);
    }

    @Override
    public Optional<Appointment> findByIdWithLock(UUID id) {
        return jpaAppointmentRepository.findByIdWithLock(id);
    }
}
