package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.MonthlyRevenueResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.TopDoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.TopMedicineResponse;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.StatisticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminStatisticsService {

    private final StatisticsRepository statisticsRepository;

    public List<TopDoctorResponse> getTopDoctors(int limit) {
        log.info("Lấy top {} bác sĩ toàn hệ thống", limit);

        List<Object[]> results = statisticsRepository.findTopDoctorsForAdmin(limit);

        List<TopDoctorResponse> topDoctors = new ArrayList<>();
        int rank = 1;
        for (Object[] row : results) {
            if (rank > limit) break;

            UUID doctorId = (UUID) row[0];
            String doctorName = (String) row[1];
            String specialtyName = (String) row[2];
            long revenueCollected = ((Number) row[3]).longValue();
            long revenueCompleted = ((Number) row[4]).longValue();
            long patientsCompleted = ((Number) row[5]).longValue();
            long bookingsPaid = ((Number) row[6]).longValue();
            double avgRating = ((Number) row[7]).doubleValue();

            topDoctors.add(TopDoctorResponse.builder()
                    .doctorId(doctorId)
                    .doctorName(doctorName)
                    .specialtyName(specialtyName != null ? specialtyName : "Chưa phân loại")
                    .totalRevenueCollected(revenueCollected)
                    .totalRevenueCompleted(revenueCompleted)
                    .totalPatientsCompleted(patientsCompleted)
                    .totalBookingsPaid(bookingsPaid)
                    .averageRating(Math.round(avgRating * 10) / 10.0)
                    .rank(rank++)
                    .build());
        }

        return topDoctors;
    }

    public List<TopMedicineResponse> getTopMedicines(int limit) {
        log.info("Lấy top {} thuốc toàn hệ thống", limit);

        List<Object[]> results = statisticsRepository.getTopMedicinesForAdmin(limit);

        if (results == null || results.isEmpty()) {
            log.warn("Không có dữ liệu top thuốc");
            return Collections.emptyList();
        }

        return results.stream()
                .map(row -> {
                    String medicineName = row[0] != null ? (String) row[0] : "Không xác định";
                    Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                    return TopMedicineResponse.builder()
                            .medicineName(medicineName)
                            .prescriptionCount(count)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<MonthlyRevenueResponse> getMonthlyRevenue() {
        log.info("Lấy doanh thu theo tháng toàn hệ thống");

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(11).withDayOfMonth(1);
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<Object[]> results = statisticsRepository.getMonthlyRevenueForAdmin(start, end);

        Map<String, Long> revenueMap = new HashMap<>();
        for (Object[] row : results) {
            int month = ((Number) row[0]).intValue();
            int year = ((Number) row[1]).intValue();
            long revenue = ((Number) row[2]).longValue();
            String key = year + "-" + month;
            revenueMap.put(key, revenue);
        }

        List<MonthlyRevenueResponse> monthlyRevenues = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            LocalDate date = startDate.plusMonths(i);
            int month = date.getMonthValue();
            int year = date.getYear();
            String key = year + "-" + month;
            long revenue = revenueMap.getOrDefault(key, 0L);
            monthlyRevenues.add(MonthlyRevenueResponse.builder()
                    .month(month)
                    .year(year)
                    .revenue(revenue)
                    .build());
        }

        return monthlyRevenues;
    }
}