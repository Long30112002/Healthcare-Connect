package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistActivityAction;
import com.hoanglong.healthcare_connect_backend.core.entity.ReceptionistActivityHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReceptionistActivityHistoryRepository extends JpaRepository<ReceptionistActivityHistory, Long> {
    List<ReceptionistActivityHistory> findByReceptionistId(UUID receptionistId);

    List<ReceptionistActivityHistory> findByReceptionistIdOrderByCreatedAtDesc(UUID receptionistId);

    List<ReceptionistActivityHistory> findByHospitalId(UUID hospitalId);

    List<ReceptionistActivityHistory> findByAction(ReceptionistActivityAction action);

    List<ReceptionistActivityHistory> findByAppointmentId(UUID appointmentId);

    List<ReceptionistActivityHistory> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}