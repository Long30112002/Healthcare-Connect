//package com.hoanglong.healthcare_connect_backend.core.repository;
//
//import com.hoanglong.healthcare_connect_backend.core.entity.Department;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//public interface IDepartmentRepository {
//    Optional<Department> findById(UUID id);
//
//    List<Department> findAll(); // Thêm để lấy danh sách khoa
//
//    boolean existsByCode(String code);
//
//    Department save(Department department);
//
//    void deleteById(UUID id); // Thêm để xóa khoa
//}