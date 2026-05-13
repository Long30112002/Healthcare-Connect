package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, UUID>
{
    List<Specialty> findAllByDepartmentId(UUID departmentId);
    // Kiểm tra xem tên chuyên khoa đã tồn tại chưa (để báo lỗi ALREADY_EXISTS)
    boolean existsByName(String name);

    List<Specialty> findByHospitalId(UUID hospitalId);
    Optional<Specialty> findByIdAndHospitalId(UUID id, UUID hospitalId);
    boolean existsByNameAndHospitalId(String name, UUID hospitalId);
    boolean existsByNameAndHospitalIdAndIdNot(String name, UUID hospitalId, UUID id);
}
