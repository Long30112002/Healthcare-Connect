//package com.hoanglong.healthcare_connect_backend.core.repository;
//
//import com.hoanglong.healthcare_connect_backend.core.entity.DoctorHistory;
//
//import java.util.List;
//import java.util.UUID;
//
//public interface IDoctorHistoryRepository {
//
//    DoctorHistory save(DoctorHistory history);
//
//    List<DoctorHistory> findByDoctorId(UUID doctorId);
//
//    List<DoctorHistory> findByDoctorIdAndAction(UUID doctorId, String action);
//
//    List<DoctorHistory> findByDoctorIdOrderByCreatedAtDesc(UUID doctorId);
//
//    long countByDoctorIdAndAction(UUID doctorId, String action);
//}