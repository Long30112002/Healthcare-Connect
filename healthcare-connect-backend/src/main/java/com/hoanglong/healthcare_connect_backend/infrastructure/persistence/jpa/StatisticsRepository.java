package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface StatisticsRepository extends JpaRepository<Appointment, UUID> {

    // Đếm theo trạng thái
    long countByStatusAndAppointmentDateBetween(AppointmentStatus status, LocalDateTime start, LocalDateTime end);

    // THỐNG KÊ THEO GIỜ
    @Query(value = "SELECT EXTRACT(HOUR FROM a.appointment_date) as hour, COUNT(a.id) as total, " +
            "SUM(CASE WHEN a.status = :checkedInStatus THEN 1 ELSE 0 END) as checkedIn, " +
            "SUM(CASE WHEN a.status = :waitingStatus THEN 1 ELSE 0 END) as waiting " +
            "FROM appointments a " +
            "WHERE a.appointment_date BETWEEN :start AND :end " +
            "GROUP BY EXTRACT(HOUR FROM a.appointment_date) " +
            "ORDER BY EXTRACT(HOUR FROM a.appointment_date) ASC",
            nativeQuery = true)
    List<Object[]> getHourlyStatistics(@Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("checkedInStatus") String checkedInStatus,
            @Param("waitingStatus") String waitingStatus);

    // THỐNG KÊ THEO BÁC SĨ
    @Query(value = "SELECT CAST(d.id AS VARCHAR) as doctor_id, u.full_name, COUNT(a.id) as total, " +
            "SUM(CASE WHEN a.status = :checkedInStatus THEN 1 ELSE 0 END) as checkedIn " +
            "FROM appointments a " +
            "JOIN schedules s ON a.schedule_id = s.id " +
            "JOIN doctors d ON s.doctor_id = d.id " +
            "JOIN users u ON d.user_id = u.id " +
            "WHERE a.appointment_date BETWEEN :start AND :end " +
            "GROUP BY d.id, u.full_name ORDER BY total DESC",
            nativeQuery = true)
    List<Object[]> getDoctorStatistics(@Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("checkedInStatus") String checkedInStatus);

    //THỐNG KÊ THEO NGÀY
    @Query(value = "SELECT CAST(a.appointment_date AS DATE) as date, COUNT(a.id) as total, " +
            "SUM(CASE WHEN a.status = :checkedInStatus THEN 1 ELSE 0 END) as checkedIn, " +
            "SUM(CASE WHEN a.status = :waitingStatus THEN 1 ELSE 0 END) as waiting " +
            "FROM appointments a " +
            "WHERE a.appointment_date BETWEEN :start AND :end " +
            "GROUP BY CAST(a.appointment_date AS DATE) " +
            "ORDER BY CAST(a.appointment_date AS DATE) ASC",
            nativeQuery = true)
    List<Object[]> getDailyStatistics(@Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("checkedInStatus") String checkedInStatus,
            @Param("waitingStatus") String waitingStatus);
}