//package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;
//
//import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
//import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
//import com.hoanglong.healthcare_connect_backend.core.repository.IAppointmentRepository;
//import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.stereotype.Component;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//@Component
//@RequiredArgsConstructor
//public class AppointmentRepositoryImpl implements IAppointmentRepository
//{
//    private final AppointmentRepository appointmentRepository;
//
//    @Override
//    public Appointment save(Appointment appointment) {
//        return appointmentRepository.save(appointment);
//    }
//
//    @Override
//    public Optional<Appointment> findById(UUID id) {
//        return appointmentRepository.findById(id);
//    }
//
//    @Override
//    public Page<Appointment> findAllByPatientId(UUID patientId, Pageable pageable) {
//        return appointmentRepository.findAllByPatientId(patientId, pageable);
//    }
//
//    @Override
//    public boolean existsByPatientOverlap(UUID patientId, String date, String startTime, List<String> excludedStatuses) {
//        return appointmentRepository.existsByPatientOverlap(patientId, date, startTime, excludedStatuses);
//    }
//
//    @Override
//    public boolean existsByPatientIdAndScheduleIdAndStatusNot(UUID patientId, UUID scheduleId, AppointmentStatus appointmentStatus) {
//        return appointmentRepository.existsByPatientIdAndScheduleIdAndStatusNot(patientId, scheduleId, appointmentStatus);
//    }
//
//    @Override
//    public Optional<Appointment> findByIdWithLock(UUID id) {
//        return appointmentRepository.findByIdWithLock(id);
//    }
//
//    @Override
//    public Page<Appointment> findByScheduleDoctorId(UUID doctorId, Pageable pageable) {
//        return appointmentRepository.findByScheduleDoctorId(doctorId, pageable);
//    }
//
//    @Override
//    public Page<Appointment> findByScheduleDoctorIdAndStatus(UUID doctorId, AppointmentStatus status, Pageable pageable) {
//        return appointmentRepository.findByScheduleDoctorIdAndStatus(doctorId, status, pageable);
//    }
//
//    @Override
//    public List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end) {
//        return appointmentRepository.findByAppointmentDateBetween(start, end);
//    }
//
//    @Override
//    public List<Appointment> searchAppointments(String keyword) {
//        return appointmentRepository.searchAppointments(keyword);
//    }
//
//    @Override
//    public Optional<Appointment> findByIdWithDetails(UUID appointmentId) {
//        return Optional.empty();
//    }
//}
