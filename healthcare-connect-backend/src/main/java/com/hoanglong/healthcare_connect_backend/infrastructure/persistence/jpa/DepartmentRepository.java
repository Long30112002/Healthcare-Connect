package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID>
{
    boolean existsByCode(String code);
    List<Department> findByHospitalId(UUID hospitalId);

    Optional<Department> findByIdAndHospitalId(UUID id, UUID hospitalId);

    boolean existsByNameAndHospitalId(String name, UUID hospitalId);

    boolean existsByCodeAndHospitalId(String code, UUID hospitalId);

    boolean existsByNameAndHospitalIdAndIdNot(String name, UUID hospitalId, UUID id);

    boolean existsByCodeAndHospitalIdAndIdNot(String code, UUID hospitalId, UUID id);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
            "FROM Specialty s WHERE s.department.id = :departmentId")
    boolean hasSpecialties(@Param("departmentId") UUID departmentId);
    // JpaRepository đã có sẵn save, findById, delete, existsById...
}