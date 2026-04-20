package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.SpecialtyRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.SpecialtyResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.application.mapper.SpecialtyMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DepartmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.SpecialtyRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SpecialtyService extends BaseService<Specialty, SpecialtyRequest, SpecialtyResponse, UUID> {
    private final SpecialtyRepository specialtyRepository;
    private final SpecialtyMapper specialtyMapper;
    private final DepartmentRepository departmentRepository;

    public SpecialtyService(
            SpecialtyRepository specialtyRepository,
            SpecialtyMapper specialtyMapper,
            DepartmentRepository departmentRepository
    ) {
        // Nạp mã lỗi riêng cho Specialty vào BaseService
        super(ErrorCode.SPECIALTY_NOT_FOUND, ErrorCode.SPECIALTY_EXISTED);
        this.specialtyRepository = specialtyRepository;
        this.specialtyMapper = specialtyMapper;
        this.departmentRepository = departmentRepository;
    }

    @Override protected JpaRepository<Specialty, UUID> getRepository() { return specialtyRepository; }
    @Override protected BaseMapper<Specialty, SpecialtyResponse> getMapper() { return specialtyMapper; }

    @Override
    protected Specialty mapToEntity(SpecialtyRequest request) {
        // 1. Tìm Khoa để lấy mã tiền tố
        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        // 2. Kiểm tra Category
        if (!dept.getCategory().equals(request.getCategory())) {
            throw new AppException(ErrorCode.SPECIALTY_CATEGORY_MISMATCH);
        }

        // 3. Sinh mã tự động: [Mã Khoa] + [_] + [5 ký tự ngẫu nhiên]
        // Ví dụ: KNOI -> KNOI_A7B2C
        String randomPart = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String autoCode = dept.getCode() + "_" + randomPart;

        return Specialty.builder()
                .name(request.getName())
                .code(autoCode)
                .description(request.getDescription())
                .category(request.getCategory())
                .department(dept)
                .build();
    }

    public SpecialtyResponse update(UUID id, SpecialtyRequest request) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_FOUND));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        if (!department.getCategory().equals(request.getCategory())) {
            throw new AppException(ErrorCode.SPECIALTY_CATEGORY_MISMATCH);
        }

        // Kiểm tra tên trùng
        if (specialtyRepository.existsByName(request.getName()) &&
                !specialty.getName().equals(request.getName())) {
            throw new AppException(ErrorCode.SPECIALTY_EXISTED);
        }

        specialty.setName(request.getName());
        specialty.setDescription(request.getDescription());
        specialty.setCategory(request.getCategory());
        specialty.setDepartment(department);

        return specialtyMapper.toResponse(specialtyRepository.save(specialty));
    }
}


