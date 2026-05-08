package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface StatisticsRepository extends JpaRepository<Appointment, UUID> {

    // Đếm theo trạng thái
    long countByStatusAndAppointmentDateBetween(AppointmentStatus status, LocalDateTime start, LocalDateTime end);

    @Query(value = "SELECT EXTRACT(HOUR FROM a.appointment_date) as hour, COUNT(a.id) as total, " +
            "SUM(CASE WHEN a.status = :checkedInStatus THEN 1 ELSE 0 END) as checkedIn, " +
            "SUM(CASE WHEN a.status = :waitingStatus THEN 1 ELSE 0 END) as waiting " +
            "FROM appointments a " +
            "WHERE a.hospital_id = :hospitalId " +
            "AND a.appointment_date BETWEEN :start AND :end " +
            "GROUP BY EXTRACT(HOUR FROM a.appointment_date) " +
            "ORDER BY EXTRACT(HOUR FROM a.appointment_date) ASC",
            nativeQuery = true)
    List<Object[]> getHourlyStatisticsByHospital(
            @Param("hospitalId") UUID hospitalId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("checkedInStatus") String checkedInStatus,
            @Param("waitingStatus") String waitingStatus
    );

    @Query(value = "SELECT d.id, u.full_name, s.name as specialty_name, " +
            "COUNT(DISTINCT a.id) as total_patients, " +
            "COALESCE(SUM(CASE WHEN a.is_paid = true THEN sched.price ELSE 0 END), 0) as total_revenue, " +
            "COALESCE(AVG(r.rating), 0) as avg_rating " +
            "FROM doctors d " +
            "JOIN users u ON d.user_id = u.id " +
            "JOIN specialties s ON d.specialty_id = s.id " +
            "LEFT JOIN schedules sched ON d.id = sched.doctor_id " +
            "LEFT JOIN appointments a ON sched.id = a.schedule_id " +
            "LEFT JOIN reviews r ON d.id = r.doctor_id AND r.deleted = false " +
            "WHERE d.hospital_id = CAST(:hospitalId AS uuid) " +
            "AND d.status = 'APPROVED' " +
            "GROUP BY d.id, u.full_name, s.name " +
            "ORDER BY total_patients DESC " +
            "LIMIT :limit",
            nativeQuery = true)
    List<Object[]> findTopDoctorsByHospital(@Param("hospitalId") UUID hospitalId,
            @Param("limit") int limit);

    @Query(value = "SELECT CAST(EXTRACT(DOW FROM a.appointment_date) AS INTEGER) as day_of_week, COUNT(a.id) " +
            "FROM appointments a " +
            "WHERE a.hospital_id = CAST(:hospitalId AS uuid) " +
            "AND a.appointment_date BETWEEN :start AND :end " +
            "AND a.status IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED') " +
            "GROUP BY CAST(EXTRACT(DOW FROM a.appointment_date) AS INTEGER) " +
            "ORDER BY day_of_week",
            nativeQuery = true)
    List<Object[]> getWeeklyStatisticsByHospital(@Param("hospitalId") UUID hospitalId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) FROM Appointment a " +
            "WHERE a.hospital.id = :hospitalId " +
            "AND a.status = :status " +
            "AND FUNCTION('DATE', a.appointmentDate) = :date")
    long countByHospitalIdAndStatusAndDate(
            @Param("hospitalId") UUID hospitalId,
            @Param("status") AppointmentStatus status,
            @Param("date") LocalDate date
    );

    @Query(value = "SELECT CAST(d.id AS VARCHAR) as doctor_id, u.full_name, COUNT(a.id) as total, " +
            "SUM(CASE WHEN a.status = :checkedInStatus THEN 1 ELSE 0 END) as checkedIn " +
            "FROM appointments a " +
            "JOIN schedules s ON a.schedule_id = s.id " +
            "JOIN doctors d ON s.doctor_id = d.id " +
            "JOIN users u ON d.user_id = u.id " +
            "WHERE d.hospital_id = CAST(:hospitalId AS uuid) " +
            "AND a.appointment_date BETWEEN :start AND :end " +
            "GROUP BY d.id, u.full_name ORDER BY total DESC",
            nativeQuery = true)
    List<Object[]> getDoctorStatisticsByHospital(
            @Param("hospitalId") UUID hospitalId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("checkedInStatus") String checkedInStatus
    );

    @Query(value = "SELECT CAST(a.appointment_date AS DATE) as date, COUNT(a.id) as total, " +
            "SUM(CASE WHEN a.status = :checkedInStatus THEN 1 ELSE 0 END) as checkedIn, " +
            "SUM(CASE WHEN a.status = :waitingStatus THEN 1 ELSE 0 END) as waiting " +
            "FROM appointments a " +
            "WHERE a.hospital_id = CAST(:hospitalId AS uuid) " +
            "AND a.appointment_date BETWEEN :start AND :end " +
            "GROUP BY CAST(a.appointment_date AS DATE) " +
            "ORDER BY CAST(a.appointment_date AS DATE) ASC",
            nativeQuery = true)
    List<Object[]> getDailyStatisticsByHospital(
            @Param("hospitalId") UUID hospitalId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("checkedInStatus") String checkedInStatus,
            @Param("waitingStatus") String waitingStatus
    );

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

    @Query("SELECT COUNT(a) FROM Appointment a " +
            "WHERE a.hospital.id = :hospitalId " +
            "AND (:status IS NULL OR a.status = :status) " +
            "AND a.appointmentDate BETWEEN :start AND :end")
    long countByHospitalIdAndStatusAndDateBetween(
            @Param("hospitalId") UUID hospitalId,
            @Param("status") AppointmentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

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