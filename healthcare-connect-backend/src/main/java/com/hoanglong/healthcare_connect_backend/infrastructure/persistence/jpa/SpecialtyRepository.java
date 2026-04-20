package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, UUID>
{
    List<Specialty> findAllByDepartmentId(UUID departmentId);
    // Kiểm tra xem tên chuyên khoa đã tồn tại chưa (để báo lỗi ALREADY_EXISTS)
    boolean existsByName(String name);
}
