package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.hospital.SpecialtyRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.SpecialtyResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.application.mapper.SpecialtyMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.MedicalCategory;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DepartmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.SpecialtyRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
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
        super(ErrorCode.SPECIALTY_NOT_FOUND, ErrorCode.SPECIALTY_EXISTED);
        this.specialtyRepository = specialtyRepository;
        this.specialtyMapper = specialtyMapper;
        this.departmentRepository = departmentRepository;
    }

    @Override
    protected JpaRepository<Specialty, UUID> getRepository() {
        return specialtyRepository;
    }

    @Override
    protected BaseMapper<Specialty, SpecialtyResponse> getMapper() {
        return specialtyMapper;
    }

    @Override
    protected Specialty mapToEntity(SpecialtyRequest request) {
        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        MedicalCategory category = dept.getCategory();

        if (category == null) {
            throw new AppException(ErrorCode.DEPARTMENT_CATEGORY_REQUIRED);
        }

        String randomPart = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String autoCode = dept.getCode() + "_" + randomPart;

        return Specialty.builder()
                .name(request.getName())
                .code(autoCode)
                .description(request.getDescription())
                .category(category)  // lấy từ department
                .department(dept)
                .build();
    }

    // CREATE - KHÔNG cần category trong request
    public SpecialtyResponse create(SpecialtyRequest request, UUID hospitalId) {
        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        if (request.getCategory() == null || !dept.getCategory().equals(request.getCategory())) {
            throw new AppException(ErrorCode.SPECIALTY_CATEGORY_MISMATCH);
        }

        // Kiểm tra tên trùng
        boolean exists = specialtyRepository.existsByNameAndHospitalId(request.getName(), hospitalId);
        if (exists) {
            throw new AppException(ErrorCode.SPECIALTY_EXISTED);
        }

        // Sinh mã tự động
        String randomPart = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String autoCode = dept.getCode() + "_" + randomPart;

        Specialty specialty = Specialty.builder()
                .name(request.getName())
                .code(autoCode)
                .description(request.getDescription())
                .category(request.getCategory())
                .department(dept)
                .hospitalId(hospitalId)
                .build();

        return specialtyMapper.toResponse(specialtyRepository.save(specialty));
    }

    public List<SpecialtyResponse> getAllByHospital(UUID hospitalId) {
        return specialtyRepository.findByHospitalId(hospitalId)
                .stream()
                .map(specialtyMapper::toResponse)
                .toList();
    }

    public SpecialtyResponse getByIdAndHospital(UUID id, UUID hospitalId) {
        Specialty specialty = specialtyRepository.findByIdAndHospitalId(id, hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_FOUND));
        return specialtyMapper.toResponse(specialty);
    }

    // UPDATE - KHÔNG cần category trong request
    public SpecialtyResponse update(UUID id, SpecialtyRequest request, UUID hospitalId) {
        Specialty specialty = specialtyRepository.findByIdAndHospitalId(id, hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_FOUND));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        MedicalCategory category = department.getCategory();

        if (category == null) {
            throw new AppException(ErrorCode.DEPARTMENT_CATEGORY_REQUIRED);
        }

        boolean exists = specialtyRepository.existsByNameAndHospitalIdAndIdNot(
                request.getName(), hospitalId, id);
        if (exists) {
            throw new AppException(ErrorCode.SPECIALTY_EXISTED);
        }

        specialty.setName(request.getName());
        specialty.setDescription(request.getDescription());
        specialty.setCategory(category);  // cập nhật từ department mới
        specialty.setDepartment(department);

        return specialtyMapper.toResponse(specialtyRepository.save(specialty));
    }

    public void delete(UUID id, UUID hospitalId) {
        Specialty specialty = specialtyRepository.findByIdAndHospitalId(id, hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_FOUND));
        specialtyRepository.delete(specialty);
    }

    // ADMIN METHOD - giữ cho Admin
    public SpecialtyResponse update(UUID id, SpecialtyRequest request) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_FOUND));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        MedicalCategory category = department.getCategory();

        if (category == null) {
            throw new AppException(ErrorCode.DEPARTMENT_CATEGORY_REQUIRED);
        }

        if (specialtyRepository.existsByName(request.getName()) &&
                !specialty.getName().equals(request.getName())) {
            throw new AppException(ErrorCode.SPECIALTY_EXISTED);
        }

        specialty.setName(request.getName());
        specialty.setDescription(request.getDescription());
        specialty.setCategory(category);
        specialty.setDepartment(department);

        return specialtyMapper.toResponse(specialtyRepository.save(specialty));
    }
}

