package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.hospital.DepartmentRequest;
import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.DepartmentResponse;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DepartmentRepository;
import com.hoanglong.healthcare_connect_backend.application.mapper.DepartmentMapper;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class DepartmentService extends BaseService<Department, DepartmentRequest, DepartmentResponse, UUID> {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    public DepartmentService(DepartmentRepository departmentRepository, DepartmentMapper departmentMapper) {
        super(ErrorCode.DEPARTMENT_NOT_FOUND, ErrorCode.DEPARTMENT_EXISTED);
        this.departmentRepository = departmentRepository;
        this.departmentMapper = departmentMapper;
    }

    @Override
    protected JpaRepository<Department, UUID> getRepository() { return departmentRepository; }

    @Override
    protected BaseMapper<Department, DepartmentResponse> getMapper() {
        return departmentMapper;
    }

    @Override
    protected Department mapToEntity(DepartmentRequest request) {
        return Department.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .build();
    }

    // Hàm Tạo mới (Create)
    public DepartmentResponse create(DepartmentRequest request) {
        // 1. Chuyển DTO sang Entity
        Department entity = mapToEntity(request);

        // 2. Kiểm tra trùng mã
        if (departmentRepository.existsByCode(entity.getCode())) {
            throw new AppException(ErrorCode.DEPARTMENT_EXISTED);
        }

        return departmentMapper.toResponse(departmentRepository.save(entity));
    }

    public DepartmentResponse update(UUID id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        department.setName(request.getName());
        department.setCode(request.getCode().toUpperCase());
        department.setDescription(request.getDescription());

        return departmentMapper.toResponse(departmentRepository.save(department));
    }
}