package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID>
{
    boolean existsByUserId(UUID userId);
    List<Doctor> findAllByStatus(DoctorStatus status);
    Optional<Doctor> findByUserId(UUID userId);
    List<Doctor> findAllByHospitalId(UUID hospitalId);
    List<Doctor> findAllByHospitalIdAndStatus(UUID hospitalId, DoctorStatus status);

    @Query("SELECT DISTINCT d FROM Appointment a " +
            "JOIN a.schedule s " +
            "JOIN s.doctor d " +
            "WHERE a.patient.id = :patientId " +
            "AND a.status IN :statuses")
    List<Doctor> findVisitedDoctorsByPatientId(@Param("patientId") UUID patientId,
            @Param("statuses") List<AppointmentStatus> statuses);

    @Query("SELECT DISTINCT d FROM Doctor d " +
            "JOIN d.schedules s " +
            "WHERE d.status = :doctorStatus " +
            "AND s.status = :scheduleStatus " +
            "AND s.date BETWEEN :startDate AND :endDate " +
            "AND s.currentBookings < s.maxPatients")
    List<Doctor> findAvailableDoctorsWithSchedules(
            @Param("doctorStatus") DoctorStatus doctorStatus,
            @Param("scheduleStatus") ScheduleStatus scheduleStatus,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
