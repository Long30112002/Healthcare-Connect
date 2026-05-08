package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.ManagerDashboardStatsResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.TopDoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.WeeklyStatResponse;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DoctorRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.StatisticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManagerStatisticsService
{
    private final DoctorRepository doctorRepository;
    private final ReceptionistRepository receptionistRepository;
    private final AppointmentRepository appointmentRepository;
    private final StatisticsRepository statisticsRepository;

    public ManagerDashboardStatsResponse getManagerDashboardStats(UUID hospitalId) {
        log.info("Lấy thống kê dashboard cho bệnh viện: {}", hospitalId);

        // 1. Tổng số bác sĩ
        long totalDoctors = doctorRepository.countByHospitalId(hospitalId);
        double doctorsChange = calculateDoctorChange(hospitalId);

        // 2. Tổng số lễ tân
        long totalReceptionists = receptionistRepository.countByHospitalId(hospitalId);
        double receptionistsChange = calculateReceptionistChange(hospitalId);

        // 3. Số lịch hẹn hôm nay
        LocalDate today = LocalDate.now();
        long totalAppointmentsToday = appointmentRepository.countByHospitalIdAndDate(hospitalId, today);
        double appointmentsChange = calculateAppointmentsChange(hospitalId, today);

        // 4. Doanh thu tháng này
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();
        long revenueThisMonth = appointmentRepository.sumRevenueByHospitalIdAndDateRange(hospitalId, startOfMonth, endOfMonth);
        double revenueChange = calculateRevenueChange(hospitalId, currentMonth);

        return ManagerDashboardStatsResponse.builder()
                .totalDoctors(totalDoctors)
                .totalDoctorsChange(doctorsChange)
                .totalReceptionists(totalReceptionists)
                .totalReceptionistsChange(receptionistsChange)
                .totalAppointmentsToday(totalAppointmentsToday)
                .totalAppointmentsTodayChange(appointmentsChange)
                .revenueThisMonth(revenueThisMonth)
                .revenueThisMonthChange(revenueChange)
                .build();
    }

    private double calculateDoctorChange(UUID hospitalId) {
        LocalDate now = LocalDate.now();

        // Đầu tháng này (00:00:00)
        LocalDateTime startOfThisMonth = now.withDayOfMonth(1).atStartOfDay();
        // Cuối tháng này (23:59:59)
        LocalDateTime endOfThisMonth = now.atTime(23, 59, 59);

        // Đầu tháng trước
        LocalDate lastMonthDate = now.minusMonths(1);
        LocalDateTime startOfLastMonth = lastMonthDate.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfLastMonth = lastMonthDate.atTime(23, 59, 59);

        long currentCount = doctorRepository.countByHospitalIdAndCreatedAtBetween(
                hospitalId, startOfThisMonth, endOfThisMonth);

        long lastCount = doctorRepository.countByHospitalIdAndCreatedAtBetween(
                hospitalId, startOfLastMonth, endOfLastMonth);

        if (lastCount == 0) return 0;
        return ((double) (currentCount - lastCount) / lastCount) * 100;
    }

    private double calculateReceptionistChange(UUID hospitalId) {
        LocalDate now = LocalDate.now();

        LocalDateTime startOfThisMonth = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfThisMonth = now.atTime(23, 59, 59);

        LocalDate lastMonthDate = now.minusMonths(1);
        LocalDateTime startOfLastMonth = lastMonthDate.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfLastMonth = lastMonthDate.atTime(23, 59, 59);

        long currentCount = receptionistRepository.countByHospitalIdAndCreatedAtBetween(
                hospitalId, startOfThisMonth, endOfThisMonth);

        long lastCount = receptionistRepository.countByHospitalIdAndCreatedAtBetween(
                hospitalId, startOfLastMonth, endOfLastMonth);

        if (lastCount == 0) return 0;
        return ((double) (currentCount - lastCount) / lastCount) * 100;
    }

    private double calculateAppointmentsChange(UUID hospitalId, LocalDate today) {
        long todayCount = appointmentRepository.countByHospitalIdAndDate(hospitalId, today);
        long yesterdayCount = appointmentRepository.countByHospitalIdAndDate(hospitalId, today.minusDays(1));

        if (yesterdayCount == 0) return 0;
        return ((double) (todayCount - yesterdayCount) / yesterdayCount) * 100;
    }

    private double calculateRevenueChange(UUID hospitalId, YearMonth currentMonth) {
        LocalDate currentStart = currentMonth.atDay(1);
        LocalDate currentEnd = currentMonth.atEndOfMonth();
        long currentRevenue = appointmentRepository.sumRevenueByHospitalIdAndDateRange(hospitalId, currentStart, currentEnd);

        YearMonth lastMonth = currentMonth.minusMonths(1);
        LocalDate lastStart = lastMonth.atDay(1);
        LocalDate lastEnd = lastMonth.atEndOfMonth();
        long lastRevenue = appointmentRepository.sumRevenueByHospitalIdAndDateRange(hospitalId, lastStart, lastEnd);

        if (lastRevenue == 0) return 0;
        return ((double) (currentRevenue - lastRevenue) / lastRevenue) * 100;
    }

    public List<WeeklyStatResponse> getWeeklyStatistics(UUID hospitalId) {
        // Lấy 7 ngày gần nhất (từ 7 ngày trước đến hôm nay)
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<Object[]> results = statisticsRepository.getWeeklyStatisticsByHospital(hospitalId, start, end);

        // Map kết quả từ database
        Map<Integer, Long> countByDayOfWeek = new HashMap<>();
        for (Object[] row : results) {
            int dayOfWeek = (int) row[0];
            long count = (long) row[1];
            int convertedDay = convertDayOfWeek(dayOfWeek);
            countByDayOfWeek.put(convertedDay, count);
        }

        // Tạo danh sách 7 ngày (Thứ 2 -> Chủ nhật)
        List<WeeklyStatResponse> weeklyStats = new ArrayList<>();
        int[] days = {8, 2, 3, 4, 5, 6, 7};
        String[] dayNames = {"Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"};

        for (int i = 0; i < days.length; i++) {
            long count = countByDayOfWeek.getOrDefault(days[i], 0L);
            weeklyStats.add(WeeklyStatResponse.builder()
                    .day(dayNames[i])
                    .dayOfWeek(days[i])
                    .count(count)
                    .build());
        }

        return weeklyStats;
    }

    private int convertDayOfWeek(int postgresDow) {
        // Postgres: 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
        // Quy ước: 8=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7, 7=CN
        switch (postgresDow) {
            case 0: return 7;  // CN
            case 1: return 8;  // T2
            default: return postgresDow + 1; // T3->2, T4->3, T5->4, T6->5, T7->6
        }
    }

    public List<TopDoctorResponse> getTopDoctors(UUID hospitalId, int limit) {
        List<Object[]> results = statisticsRepository.findTopDoctorsByHospital(hospitalId, limit);

        List<TopDoctorResponse> topDoctors = new ArrayList<>();
        int rank = 1;

        for (Object[] row : results) {
            UUID doctorId = (UUID) row[0];
            String doctorName = (String) row[1];
            String specialtyName = (String) row[2];
            long totalPatients = ((Number) row[3]).longValue();
            BigDecimal totalRevenue = (BigDecimal) row[4];
            double averageRating = ((Number) row[5]).doubleValue();

            topDoctors.add(TopDoctorResponse.builder()
                    .doctorId(doctorId)
                    .doctorName(doctorName)
                    .specialtyName(specialtyName)
                    .totalPatients(totalPatients)
                    .totalRevenue(totalRevenue)
                    .averageRating(Math.round(averageRating * 10) / 10.0)
                    .rank(rank++)
                    .build());
        }

        return topDoctors;
    }
}
