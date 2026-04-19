package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;


import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistApplicationStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.ReceptionistApplicationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReceptionistApplicationHistoryRepository extends JpaRepository<ReceptionistApplicationHistory, Long> {

    List<ReceptionistApplicationHistory> findByReceptionistId(UUID receptionistId);

    List<ReceptionistApplicationHistory> findByReceptionistIdOrderByCreatedAtDesc(UUID receptionistId);

    List<ReceptionistApplicationHistory> findByAction(ReceptionistApplicationStatus action);

    List<ReceptionistApplicationHistory> findByNewStatus(ReceptionistStatus status);

    List<ReceptionistApplicationHistory> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}