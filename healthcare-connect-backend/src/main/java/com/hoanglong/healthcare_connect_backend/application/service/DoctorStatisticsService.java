package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.statistics.doctor.*;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorStatisticsService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ReviewRepository reviewRepository;

    // ==================== PERIOD UTILS ====================

    private LocalDateTime getStartDate(String period, LocalDate now) {
        switch (period) {
            case "week":
                // Đầu tuần (Thứ 2)
                return now.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).atStartOfDay();
            case "month":
                // Đầu tháng
                return now.withDayOfMonth(1).atStartOfDay();
            case "year":
                // Đầu năm
                return now.withDayOfYear(1).atStartOfDay();
            default:
                return now.withDayOfMonth(1).atStartOfDay();
        }
    }

    private LocalDateTime getEndDate(String period, LocalDate now) {
        switch (period) {
            case "week":
                // Cuối tuần (Chủ nhật)
                return now.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY)).atTime(LocalTime.MAX);
            case "month":
                // Cuối tháng
                return now.withDayOfMonth(now.lengthOfMonth()).atTime(LocalTime.MAX);
            case "year":
                // Cuối năm
                return now.withDayOfYear(now.lengthOfYear()).atTime(LocalTime.MAX);
            default:
                return now.withDayOfMonth(now.lengthOfMonth()).atTime(LocalTime.MAX);
        }
    }

    private LocalDateTime getPreviousPeriodStartDate(String period, LocalDate now, LocalDateTime currentStart) {
        switch (period) {
            case "week":
                return currentStart.minusWeeks(1);
            case "month":
                return currentStart.minusMonths(1);
            case "year":
                return currentStart.minusYears(1);
            default:
                return currentStart.minusMonths(1);
        }
    }

    private LocalDateTime getPreviousPeriodEndDate(LocalDateTime previousStart, String period) {
        switch (period) {
            case "week":
                return previousStart.plusWeeks(1).minusSeconds(1);
            case "month":
                return previousStart.plusMonths(1).minusSeconds(1);
            case "year":
                return previousStart.plusYears(1).minusSeconds(1);
            default:
                return previousStart.plusMonths(1).minusSeconds(1);
        }
    }

    // ==================== MAIN METHOD ====================

    @Transactional(readOnly = true)
    public DoctorStatisticsResponse getStatistics(UUID userId, String period) {
        // 1. Lấy thông tin doctor từ userId
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        UUID doctorId = doctor.getId();
        UUID hospitalId = doctor.getHospital().getId();

        // 2. Tính toán thời gian
        LocalDate now = LocalDate.now();
        LocalDateTime startDate = getStartDate(period, now);
        LocalDateTime endDate = getEndDate(period, now);
        LocalDateTime previousStartDate = getPreviousPeriodStartDate(period, now, startDate);
        LocalDateTime previousEndDate = getPreviousPeriodEndDate(previousStartDate, period);

        log.info("Thống kê bác sĩ {} từ {} đến {}", doctorId, startDate, endDate);

        // 3. Lấy dữ liệu tổng quan
        DoctorSummaryDTO summary = getSummary(doctorId, startDate, endDate, previousStartDate, previousEndDate);

        // 4. Lấy xu hướng theo tháng (12 tháng gần nhất)
        List<DoctorTrendDTO> monthlyTrend = getMonthlyTrend(doctorId);

        // 5. Lấy top 5 chẩn đoán
        List<TopDiagnosisDTO> topDiagnoses = getTopDiagnoses(doctorId, startDate, endDate);

        // 6. Lấy top 5 thuốc
        List<TopMedicineDTO> topMedicines = getTopMedicines(doctorId, startDate, endDate);

        // 7. Lấy phân bố đánh giá
        List<RatingDistributionDTO> ratingDistribution = getRatingDistribution(doctorId);

        // 8. Lấy xếp hạng đồng nghiệp trong cùng bệnh viện
        List<DoctorRankingDTO> doctorRanking = getDoctorRanking(hospitalId, doctorId, startDate, endDate);

        return DoctorStatisticsResponse.builder()
                .summary(summary)
                .monthlyTrend(monthlyTrend)
                .topDiagnoses(topDiagnoses)
                .topMedicines(topMedicines)
                .ratingDistribution(ratingDistribution)
                .doctorRanking(doctorRanking)
                .build();
    }

    // ==================== SUMMARY (4 STAT CARDS) ====================

    private DoctorSummaryDTO getSummary(UUID doctorId, LocalDateTime startDate, LocalDateTime endDate,
            LocalDateTime previousStartDate, LocalDateTime previousEndDate) {

        // Tổng số bệnh nhân - Dùng Number
        Number totalPatientsNum = appointmentRepository.countDistinctPatientByDoctorIdAndDateRange(
                doctorId, startDate, endDate, AppointmentStatus.COMPLETED.name());
        Long totalPatients = totalPatientsNum != null ? totalPatientsNum.longValue() : 0L;

        Number previousTotalPatientsNum = appointmentRepository.countDistinctPatientByDoctorIdAndDateRange(
                doctorId, previousStartDate, previousEndDate, AppointmentStatus.COMPLETED.name());
        Long previousTotalPatients = previousTotalPatientsNum != null ? previousTotalPatientsNum.longValue() : 0L;

        Integer totalPatientsChange = calculatePercentageChange(previousTotalPatients, totalPatients);

        // Doanh thu - Dùng Number
        Number revenueNum = appointmentRepository.sumRevenueByDoctorIdAndDateRange(
                doctorId, startDate, endDate, AppointmentStatus.COMPLETED.name());
        Long revenue = revenueNum != null ? revenueNum.longValue() : 0L;

        Number previousRevenueNum = appointmentRepository.sumRevenueByDoctorIdAndDateRange(
                doctorId, previousStartDate, previousEndDate, AppointmentStatus.COMPLETED.name());
        Long previousRevenue = previousRevenueNum != null ? previousRevenueNum.longValue() : 0L;

        Integer revenueChange = calculatePercentageChange(previousRevenue, revenue);

        // Đánh giá trung bình - Dùng Number (Double)
        Number averageRatingNum = reviewRepository.getAverageRatingByDoctorIdAndDateRange(
                doctorId, startDate, endDate);
        Double averageRating = averageRatingNum != null ? averageRatingNum.doubleValue() : 0.0;

        Number previousAverageRatingNum = reviewRepository.getAverageRatingByDoctorIdAndDateRange(
                doctorId, previousStartDate, previousEndDate);
        Double previousAverageRating = previousAverageRatingNum != null ? previousAverageRatingNum.doubleValue() : 0.0;

        Integer averageRatingChange = calculateRatingChange(previousAverageRating, averageRating);

        // Tổng số đơn thuốc - Dùng Number
        Number totalPrescriptionsNum = prescriptionRepository.countByDoctorIdAndDateRange(
                doctorId, startDate, endDate);
        Long totalPrescriptions = totalPrescriptionsNum != null ? totalPrescriptionsNum.longValue() : 0L;

        Number previousTotalPrescriptionsNum = prescriptionRepository.countByDoctorIdAndDateRange(
                doctorId, previousStartDate, previousEndDate);
        Long previousTotalPrescriptions = previousTotalPrescriptionsNum != null ? previousTotalPrescriptionsNum.longValue() : 0L;

        Integer totalPrescriptionsChange = calculatePercentageChange(previousTotalPrescriptions, totalPrescriptions);

        return DoctorSummaryDTO.builder()
                .totalPatients(totalPatients)
                .totalPatientsChange(totalPatientsChange)
                .revenue(revenue)
                .revenueChange(revenueChange)
                .averageRating(averageRating)
                .averageRatingChange(averageRatingChange)
                .totalPrescriptions(totalPrescriptions)
                .totalPrescriptionsChange(totalPrescriptionsChange)
                .build();
    }

    // ==================== MONTHLY TREND ====================

    private List<DoctorTrendDTO> getMonthlyTrend(UUID doctorId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = now.minusYears(1).withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endDate = now;

        List<Object[]> results = appointmentRepository.getMonthlyPatientCountByDoctorId(
                doctorId, startDate, endDate, AppointmentStatus.COMPLETED.name());

        Map<String, Long> trendMap = new HashMap<>();
        for (Object[] row : results) {
            Integer year = ((Number) row[0]).intValue();
            Integer month = ((Number) row[1]).intValue();
            Long count = ((Number) row[2]).longValue();
            String key = year + "-" + month;
            trendMap.put(key, count);
        }

        List<DoctorTrendDTO> trends = new ArrayList<>();
        LocalDate current = LocalDate.now().minusYears(1).withDayOfYear(1);
        for (int i = 0; i < 12; i++) {
            int year = current.getYear();
            int month = current.getMonthValue();
            String key = year + "-" + month;
            Long count = trendMap.getOrDefault(key, 0L);
            trends.add(DoctorTrendDTO.builder()
                    .month(month)
                    .year(year)
                    .count(count)
                    .build());
            current = current.plusMonths(1);
        }
        return trends;
    }

    // ==================== TOP DIAGNOSES ====================

    private List<TopDiagnosisDTO> getTopDiagnoses(UUID doctorId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = medicalRecordRepository.getTopDiagnosesByDoctorIdAndDateRange(
                doctorId, startDate, endDate);

        if (results == null || results.isEmpty()) {
            return Collections.emptyList();
        }

        return results.stream()
                .limit(5)
                .map(row -> TopDiagnosisDTO.builder()
                        .diagnosis((String) row[0])
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    // ==================== TOP MEDICINES ====================

    private List<TopMedicineDTO> getTopMedicines(UUID doctorId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = prescriptionRepository.getTopMedicinesByDoctorIdAndDateRange(
                doctorId, startDate, endDate);

        if (results == null || results.isEmpty()) {
            return Collections.emptyList();
        }

        return results.stream()
                .limit(5)
                .map(row -> TopMedicineDTO.builder()
                        .medicineName((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    // ==================== RATING DISTRIBUTION ====================

    private List<RatingDistributionDTO> getRatingDistribution(UUID doctorId) {
        List<Object[]> results = reviewRepository.getRatingDistributionByDoctorId(doctorId);

        if (results == null || results.isEmpty()) {
            return Arrays.asList(
                    createRatingDto(5, 0L, 0),
                    createRatingDto(4, 0L, 0),
                    createRatingDto(3, 0L, 0),
                    createRatingDto(2, 0L, 0),
                    createRatingDto(1, 0L, 0)
            );
        }

        Map<Integer, Long> ratingCountMap = new HashMap<>();
        long totalReviews = 0;
        for (Object[] row : results) {
            Integer rating = ((Number) row[0]).intValue();
            Long count = ((Number) row[1]).longValue();
            ratingCountMap.put(rating, count);
            totalReviews += count;
        }

        List<RatingDistributionDTO> distributions = new ArrayList<>();
        for (int stars = 5; stars >= 1; stars--) {
            Long count = ratingCountMap.getOrDefault(stars, 0L);
            int percentage = totalReviews > 0 ? (int) Math.round((double) count / totalReviews * 100) : 0;
            distributions.add(createRatingDto(stars, count, percentage));
        }
        return distributions;
    }

    private RatingDistributionDTO createRatingDto(int stars, Long count, int percentage) {
        return RatingDistributionDTO.builder()
                .stars(stars)
                .count(count)
                .percentage(percentage)
                .build();
    }

    // ==================== DOCTOR RANKING ====================

    private List<DoctorRankingDTO> getDoctorRanking(UUID hospitalId, UUID currentDoctorId,
            LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = appointmentRepository.getDoctorRankingByHospital(
                hospitalId, startDate, endDate, AppointmentStatus.COMPLETED.name());

        if (results == null || results.isEmpty()) {
            return Collections.emptyList();
        }

        List<DoctorRankingDTO> rankings = new ArrayList<>();
        int rank = 1;
        for (Object[] row : results) {
            UUID doctorId = (UUID) row[0];
            String doctorName = (String) row[1];

            // Dùng Number để ép kiểu an toàn
            Number totalPatientsNum = (Number) row[2];
            Long totalPatients = totalPatientsNum != null ? totalPatientsNum.longValue() : 0L;

            Number revenueNum = (Number) row[3];
            Long revenue = revenueNum != null ? revenueNum.longValue() : 0L;

            Number ratingNum = (Number) row[4];
            Double rating = ratingNum != null ? ratingNum.doubleValue() : 0.0;

            // Lấy tên bác sĩ từ user
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
            String fullName = doctor != null && doctor.getUser() != null
                    ? doctor.getUser().getFullName() : doctorName;

            if (doctorId.equals(currentDoctorId)) {
                fullName = fullName + " (Tôi)";
            }

            rankings.add(DoctorRankingDTO.builder()
                    .doctorId(doctorId.toString())
                    .name(fullName)
                    .totalPatients(totalPatients)
                    .revenue(revenue)
                    .rating(rating)
                    .rank(rank++)
                    .build());
        }
        return rankings;
    }

    // ==================== HELPER METHODS ====================

    private Integer calculatePercentageChange(Long previous, Long current) {
        if (previous == null || previous == 0) {
            return current != null && current > 0 ? 100 : 0;
        }
        if (current == null) {
            return -100;
        }
        double change = ((double) (current - previous) / previous) * 100;
        return (int) Math.round(change);
    }

    private Integer calculateRatingChange(Double previous, Double current) {
        if (previous == null || previous == 0) {
            return current != null && current > 0 ? 100 : 0;
        }
        if (current == null) {
            return -100;
        }
        double change = ((current - previous) / previous) * 100;
        return (int) Math.round(change);
    }
}