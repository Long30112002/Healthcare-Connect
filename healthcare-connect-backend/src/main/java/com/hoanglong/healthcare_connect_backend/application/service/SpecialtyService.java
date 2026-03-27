package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.SpecialtyRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.SpecialtyResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.application.mapper.SpecialtyMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaDepartmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaSpecialtyRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SpecialtyService extends BaseService<Specialty, SpecialtyRequest, SpecialtyResponse, UUID> {
    private final JpaSpecialtyRepository jpaSpecialtyRepository;
    private final SpecialtyMapper specialtyMapper;
    private final JpaDepartmentRepository jpaDepartmentRepository;

    public SpecialtyService(
            JpaSpecialtyRepository jpaSpecialtyRepository,
            SpecialtyMapper specialtyMapper,
            JpaDepartmentRepository jpaDepartmentRepository
    ) {
        // Nạp mã lỗi riêng cho Specialty vào BaseService
        super(ErrorCode.SPECIALTY_NOT_FOUND, ErrorCode.SPECIALTY_EXISTED);
        this.jpaSpecialtyRepository = jpaSpecialtyRepository;
        this.specialtyMapper = specialtyMapper;
        this.jpaDepartmentRepository = jpaDepartmentRepository;
    }

    @Override protected JpaRepository<Specialty, UUID> getRepository() { return jpaSpecialtyRepository; }
    @Override protected BaseMapper<Specialty, SpecialtyResponse> getMapper() { return specialtyMapper; }

    @Override
    protected Specialty mapToEntity(SpecialtyRequest request) {
        // 1. Tìm Khoa để lấy mã tiền tố
        Department dept = jpaDepartmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        // 2. Sinh mã tự động: [Mã Khoa] + [_] + [5 ký tự ngẫu nhiên]
        // Ví dụ: KNOI -> KNOI_A7B2C
        String randomPart = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String autoCode = dept.getCode() + "_" + randomPart;

        return Specialty.builder()
                .name(request.getName())
                .code(autoCode)
                .description(request.getDescription())
                .department(dept)
                .build();
    }
}


