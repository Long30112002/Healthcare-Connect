package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalWorkingHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospitalWorkingHoursRepository extends JpaRepository<HospitalWorkingHours, UUID> {

    Optional<HospitalWorkingHours> findByHospitalIdAndDayOfWeekAndIsActiveTrue(UUID hospitalId, Integer dayOfWeek);

    List<HospitalWorkingHours> findByHospitalIdAndIsActiveTrueOrderByDayOfWeekAsc(UUID hospitalId);

    boolean existsByHospitalIdAndDayOfWeekAndIsActiveTrue(UUID hospitalId, Integer dayOfWeek);

    @Modifying
    @Transactional
    @Query("UPDATE HospitalWorkingHours h SET h.isActive = false WHERE h.hospital.id = :hospitalId AND h.dayOfWeek = :dayOfWeek")
    void deactivateByHospitalIdAndDayOfWeek(@Param("hospitalId") UUID hospitalId, @Param("dayOfWeek") Integer dayOfWeek);

    @Modifying
    @Transactional
    void deleteByHospitalId(UUID hospitalId);

    @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM HospitalWorkingHours h " +
            "WHERE h.hospital.id = :hospitalId " +
            "AND h.dayOfWeek = :dayOfWeek " +
            "AND h.startTime < h.endTime " +
            "AND (h.lunchStart IS NULL OR h.lunchEnd IS NULL OR h.lunchStart < h.lunchEnd)")
    boolean isValidWorkingHours(@Param("hospitalId") UUID hospitalId, @Param("dayOfWeek") Integer dayOfWeek);
}