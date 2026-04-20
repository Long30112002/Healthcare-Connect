//package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;
//
//import com.hoanglong.healthcare_connect_backend.core.entity.DoctorHistory;
//import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorHistoryRepository;
//import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaDoctorHistoryRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Component;
//
//import java.util.List;
//import java.util.UUID;
//
//@Component
//@RequiredArgsConstructor
//public class DoctorHistoryRepositoryImpl implements IDoctorHistoryRepository {
//
//    private final JpaDoctorHistoryRepository jpaDoctorHistoryRepository;
//
//    @Override
//    public DoctorHistory save(DoctorHistory history) {
//        return jpaDoctorHistoryRepository.save(history);
//    }
//
//    @Override
//    public List<DoctorHistory> findByDoctorId(UUID doctorId) {
//        return jpaDoctorHistoryRepository.findByDoctorId(doctorId);
//    }
//
//    @Override
//    public List<DoctorHistory> findByDoctorIdAndAction(UUID doctorId, String action) {
//        return jpaDoctorHistoryRepository.findByDoctorIdAndAction(doctorId, action);
//    }
//
//    @Override
//    public List<DoctorHistory> findByDoctorIdOrderByCreatedAtDesc(UUID doctorId) {
//        return jpaDoctorHistoryRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
//    }
//
//    @Override
//    public long countByDoctorIdAndAction(UUID doctorId, String action) {
//        return jpaDoctorHistoryRepository.countByDoctorIdAndAction(doctorId, action);
//    }
//}