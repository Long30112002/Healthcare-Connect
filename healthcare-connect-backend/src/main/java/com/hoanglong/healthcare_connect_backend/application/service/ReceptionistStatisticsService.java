package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.statistics.receptionist.*;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.StatisticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceptionistStatisticsService
{

    private final StatisticsRepository statisticsRepository;
    // XỬ LÝ NGÀY THÁNG
    private LocalDate validateStartDate(LocalDate startDate) {
        if (startDate == null) {
            return LocalDate.now().minusDays(30);
        }
        return startDate;
    }

    private LocalDate validateEndDate(LocalDate endDate, LocalDate startDate) {
        if (endDate == null) {
            return LocalDate.now();
        }
        if (endDate.isBefore(startDate)) {
            log.warn("EndDate {} is before startDate {}, swapping", endDate, startDate);
            return startDate;
        }
        return endDate;
    }

    public DashboardStatistics getDashboardStatistics (String filter, UUID hospitalId){
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;

        switch (filter.toLowerCase()) {
            case "today":
                startDate = endDate;
                break;
            case "tomorrow":
                startDate = endDate.plusDays(1);
                break;
            case "week":
                startDate = endDate.minusDays(7);
                break;
            case "all":
                startDate = LocalDate.now().minusYears(1);
                endDate = LocalDate.now().plusYears(1);
                break;
            default:
                startDate = endDate;
        }

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        long waiting = statisticsRepository.countByHospitalIdAndStatusAndDate(
                hospitalId,
                AppointmentStatus.CONFIRMED,
                LocalDate.now()
        );
//        long waiting = statisticsRepository.countByHospitalIdAndStatusAndDateBetween(
//                hospitalId, AppointmentStatus.CONFIRMED, start, end);
        long checkedIn = statisticsRepository.countByHospitalIdAndStatusAndDateBetween(
                hospitalId, AppointmentStatus.IN_PROGRESS, start, end);
        long completed = statisticsRepository.countByHospitalIdAndStatusAndDateBetween(
                hospitalId, AppointmentStatus.COMPLETED, start, end);
        long cancelled = statisticsRepository.countByHospitalIdAndStatusAndDateBetween(
                hospitalId, AppointmentStatus.CANCELLED, start, end);
        long noShow = statisticsRepository.countByHospitalIdAndStatusAndDateBetween(
                hospitalId, AppointmentStatus.NO_SHOW, start, end);
        long total = waiting + checkedIn + completed + cancelled + noShow;

        long upcoming = 0;
        if ("all".equals(filter)) {
            LocalDateTime now = LocalDateTime.now();
            upcoming = statisticsRepository.countByHospitalIdAndStatusAndDateBetween(
                    hospitalId,
                    AppointmentStatus.CONFIRMED,
                    now,
                    LocalDateTime.of(2099, 12, 31, 23, 59, 59)
            );
        }

        log.info("Waiting count: {}", waiting);
        log.info("Start: {}", start);
        log.info("End: {}", end);

        return DashboardStatistics.builder()
                .waiting(waiting)
                .checkedIn(checkedIn)
                .completed(completed)
                .cancelled(cancelled)
                .noShow(noShow)
                .total(total)
                .upcoming(upcoming)
                .build();
    }

    // Thống kê theo kỳ
    public StatisticsResponse getStatisticsByPeriod(String period, UUID hospitalId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;

        switch (period.toLowerCase()) {
            case "today":
                startDate = endDate;
                break;
            case "week":
                startDate = endDate.minusDays(7);
                break;
            case "month":
                startDate = endDate.minusDays(30);
                break;
            case "quarter":
                startDate = endDate.minusDays(90);
                break;
            case "halfyear":
                startDate = endDate.minusDays(180);
                break;
            case "year":
                startDate = endDate.minusDays(365);
                break;
            default:
                startDate = endDate.minusDays(30);
        }

        return getSummaryStatistics(startDate, endDate, hospitalId);
    }

    // Thống kê tổng hợp
    public StatisticsResponse getSummaryStatistics(LocalDate startDate, LocalDate endDate, UUID hospitalId) {
        startDate = validateStartDate(startDate);
        endDate = validateEndDate(endDate, startDate);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        long total = statisticsRepository.countByHospitalIdAndStatusAndDateBetween(hospitalId, null, start, end);
        long checkedIn = statisticsRepository.countByHospitalIdAndStatusAndDateBetween(hospitalId, AppointmentStatus.IN_PROGRESS, start, end);
        long waiting = statisticsRepository.countByHospitalIdAndStatusAndDateBetween(hospitalId, AppointmentStatus.CONFIRMED, start, end);
        long cancelled = statisticsRepository.countByHospitalIdAndStatusAndDateBetween(hospitalId, AppointmentStatus.CANCELLED, start, end);
        long noShow = statisticsRepository.countByHospitalIdAndStatusAndDateBetween(hospitalId, AppointmentStatus.NO_SHOW, start, end);

        double checkInRate = total > 0 ? (double) checkedIn / total * 100 : 0;

        log.info("Thống kê từ {} đến {}: total={}, checkedIn={}, waiting={}, cancelled={}, noShow={}",
                startDate, endDate, total, checkedIn, waiting, cancelled, noShow);

        return StatisticsResponse.builder()
                .totalAppointments(total)
                .checkedIn(checkedIn)
                .waiting(waiting)
                .cancelled(cancelled)
                .noShow(noShow)
                .checkInRate(Math.round(checkInRate * 100) / 100.0)
                .build();
    }

    // Thống kê theo giờ
    public List<HourlyStatistic> getHourlyStatistics(LocalDate startDate, LocalDate endDate, UUID hospitalId) {
        startDate = validateStartDate(startDate);
        endDate = validateEndDate(endDate, startDate);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Object[]> results = statisticsRepository.getHourlyStatisticsByHospital(hospitalId, start, end,
                AppointmentStatus.IN_PROGRESS.name(),
                AppointmentStatus.CONFIRMED.name());

        List<HourlyStatistic> statistics = new ArrayList<>();

        for (Object[] row : results) {
            int hour = ((Number) row[0]).intValue();
            long total = ((Number) row[1]).longValue();
            long checkedIn = ((Number) row[2]).longValue();
            long waiting = ((Number) row[3]).longValue();

            statistics.add(HourlyStatistic.builder()
                    .hour(hour)
                    .total(total)
                    .checkedIn(checkedIn)
                    .waiting(waiting)
                    .build());
        }

        return statistics;
    }

    // Thống kê theo bác sĩ
    public List<DoctorStatistic> getDoctorStatistics(LocalDate startDate, LocalDate endDate, UUID hospitalId) {
        startDate = validateStartDate(startDate);
        endDate = validateEndDate(endDate, startDate);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Object[]> results = statisticsRepository.getDoctorStatisticsByHospital(hospitalId, start, end,
                AppointmentStatus.IN_PROGRESS.name());

        List<DoctorStatistic> statistics = new ArrayList<>();

        for (Object[] row : results) {
            UUID doctorId = UUID.fromString(row[0].toString());
            String doctorName = (String) row[1];
            long totalPatients = ((Number) row[2]).longValue();
            long checkedInPatients = ((Number) row[3]).longValue();

            statistics.add(DoctorStatistic.builder()
                    .doctorId(doctorId)
                    .doctorName(doctorName)
                    .totalPatients(totalPatients)
                    .checkedInPatients(checkedInPatients)
                    .build());
        }

        return statistics;
    }

    // Thống kê theo ngày
    public List<DailyStatistic> getDailyStatistics(LocalDate startDate, LocalDate endDate, UUID hospitalId) {
        startDate = validateStartDate(startDate);
        endDate = validateEndDate(endDate, startDate);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Object[]> results = statisticsRepository.getDailyStatisticsByHospital(hospitalId, start, end,
                AppointmentStatus.IN_PROGRESS.name(),
                AppointmentStatus.CONFIRMED.name());

        List<DailyStatistic> statistics = new ArrayList<>();

        for (Object[] row : results) {
            LocalDate date;
            Object dateObj = row[0];

            if (dateObj instanceof java.sql.Date) {
                date = ((java.sql.Date) dateObj).toLocalDate();
            } else if (dateObj instanceof LocalDate) {
                date = (LocalDate) dateObj;
            } else {
                String dateStr = dateObj.toString();
                date = LocalDate.parse(dateStr);
            }

            long total = ((Number) row[1]).longValue();
            long checkedIn = ((Number) row[2]).longValue();
            long waiting = ((Number) row[3]).longValue();

            statistics.add(DailyStatistic.builder()
                    .date(date)
                    .total(total)
                    .checkedIn(checkedIn)
                    .waiting(waiting)
                    .build());
        }

        return statistics;
    }
}