package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, UUID>
{

    // Tìm theo prescription
    List<PrescriptionItem> findByPrescriptionId(UUID prescriptionId);

    // Tìm theo medicine (để thống kê thuốc nào được kê nhiều)
    @Query("SELECT pi.medicine.id, pi.medicine.name, SUM(pi.quantity) " +
            "FROM PrescriptionItem pi " +
            "WHERE pi.prescription.medicalRecord.hospital.id = :hospitalId " +
            "AND pi.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY pi.medicine.id, pi.medicine.name " +
            "ORDER BY SUM(pi.quantity) DESC")
    List<Object[]> getMostPrescribedMedicines(
            @Param("hospitalId") UUID hospitalId,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );
}