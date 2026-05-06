package com.hoanglong.healthcare_connect_backend.application.dto.statistics.doctor;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)

public class DoctorStatisticsResponse {

    DoctorSummaryDTO summary;

    List<DoctorTrendDTO> monthlyTrend;

    List<TopDiagnosisDTO> topDiagnoses;

    List<TopMedicineDTO> topMedicines;

    List<RatingDistributionDTO> ratingDistribution;

    List<DoctorRankingDTO> doctorRanking;
}