//package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;
//
//import com.hoanglong.healthcare_connect_backend.core.entity.Department;
//import com.hoanglong.healthcare_connect_backend.core.repository.IDepartmentRepository;
//import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaDepartmentRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Component;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//@Component
//@RequiredArgsConstructor
//public class DepartmentRepositoryImpl implements IDepartmentRepository {
//    private final JpaDepartmentRepository jpaRepository;
//
//    @Override
//    public Optional<Department> findById(UUID id) {
//        return jpaRepository.findById(id);
//    }
//
//    @Override
//    public List<Department> findAll() {
//        return jpaRepository.findAll();
//    }
//
//    @Override
//    public boolean existsByCode(String code) {
//        return jpaRepository.existsByCode(code);
//    }
//
//    @Override
//    public Department save(Department department) {
//        return jpaRepository.save(department);
//    }
//
//    @Override
//    public void deleteById(UUID id) {
//        jpaRepository.deleteById(id);
//    }
//}