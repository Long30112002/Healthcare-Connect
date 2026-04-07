package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.DoctorHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaDoctorHistoryRepository extends JpaRepository<DoctorHistory, Long> {

    List<DoctorHistory> findByDoctorId(UUID doctorId);

    List<DoctorHistory> findByDoctorIdAndAction(UUID doctorId, String action);

    List<DoctorHistory> findByDoctorIdOrderByCreatedAtDesc(UUID doctorId);

    long countByDoctorIdAndAction(UUID doctorId, String action);
}