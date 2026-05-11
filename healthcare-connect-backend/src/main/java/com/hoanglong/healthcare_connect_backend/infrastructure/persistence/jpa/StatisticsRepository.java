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

    @Query(value = "SELECT m.name as medicine_name, " +
            "COUNT(pi.id) as prescription_count " +
            "FROM prescription_items pi " +
            "JOIN medicines m ON pi.medicine_id = m.id " +
            "JOIN prescriptions p ON pi.prescription_id = p.id " +
            "JOIN medical_records mr ON p.medical_record_id = mr.id " +
            "WHERE mr.hospital_id = CAST(:hospitalId AS uuid) " +
            "AND m.deleted = false " +
            "GROUP BY m.id, m.name " +
            "ORDER BY prescription_count DESC " +
            "LIMIT :limit",
            nativeQuery = true)
    List<Object[]> getTopMedicinesByHospital(@Param("hospitalId") UUID hospitalId,
            @Param("limit") int limit);

    @Query(value = "SELECT d.name as department_name, " +
            "COUNT(DISTINCT a.id) as total_patients, " +
            "COALESCE(SUM(s.price), 0) as total_revenue " +
            "FROM appointments a " +
            "JOIN schedules s ON a.schedule_id = s.id " +
            "JOIN doctors doc ON s.doctor_id = doc.id " +
            "JOIN departments d ON doc.department_id = d.id " +
            "WHERE a.hospital_id = CAST(:hospitalId AS uuid) " +
            "AND a.is_paid = true " +
            "AND a.status != 'CANCELLED' " +
            "GROUP BY d.id, d.name " +
            "ORDER BY total_revenue DESC",
            nativeQuery = true)
    List<Object[]> getDepartmentStatisticsByHospital(@Param("hospitalId") UUID hospitalId);

    @Query(value = "SELECT EXTRACT(MONTH FROM a.appointment_date) as month, " +
            "EXTRACT(YEAR FROM a.appointment_date) as year, " +
            "COALESCE(SUM(s.price), 0) as revenue " +
            "FROM appointments a " +
            "JOIN schedules s ON a.schedule_id = s.id " +
            "WHERE a.hospital_id = CAST(:hospitalId AS uuid) " +
            "AND a.is_paid = true " +
            "AND a.status != 'CANCELLED' " +
            "AND a.appointment_date BETWEEN :startDate AND :endDate " +
            "GROUP BY EXTRACT(YEAR FROM a.appointment_date), EXTRACT(MONTH FROM a.appointment_date) " +
            "ORDER BY year ASC, month ASC",
            nativeQuery = true)
    List<Object[]> getMonthlyRevenueByHospital(@Param("hospitalId") UUID hospitalId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

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