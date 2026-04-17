package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.AppointmentMapper;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ReceptionistService {
    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;

    public Page<AppointmentResponse> getAppointments(String filter, Pageable pageable) {
        LocalDate today = LocalDate.now();

        switch (filter) {
            case "tomorrow":
                return appointmentRepository.findByScheduleDate(today.plusDays(1), pageable)
                        .map(appointmentMapper::toResponse);
            case "week":
                return appointmentRepository.findByScheduleDateBetween(today, today.plusDays(7), pageable)
                        .map(appointmentMapper::toResponse);
            case "all":
                return appointmentRepository.findAllByOrderByScheduleDateAsc(pageable)
                        .map(appointmentMapper::toResponse);
            default: // today
                return appointmentRepository.findByScheduleDate(today, pageable)
                        .map(appointmentMapper::toResponse);
        }
    }
}