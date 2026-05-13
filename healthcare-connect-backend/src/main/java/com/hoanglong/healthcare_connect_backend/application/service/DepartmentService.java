package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.hospital.DepartmentRequest;
import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.DepartmentResponse;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DepartmentRepository;
import com.hoanglong.healthcare_connect_backend.application.mapper.DepartmentMapper;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
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
                .category(request.getCategory())
                .build();
    }

    public DepartmentResponse create(DepartmentRequest request) {
        Department entity = mapToEntity(request);
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
        department.setCategory(request.getCategory());
        return departmentMapper.toResponse(departmentRepository.save(department));
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllByHospital(UUID hospitalId) {
        return departmentRepository.findByHospitalId(hospitalId).stream()
                .map(departmentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getByIdAndHospital(UUID id, UUID hospitalId) {
        Department department = departmentRepository.findByIdAndHospitalId(id, hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));
        return departmentMapper.toResponse(department);
    }

    @Transactional
    public DepartmentResponse createForHospital(DepartmentRequest request, UUID hospitalId) {
        log.info("=== CREATE FOR HOSPITAL CALLED ===");
        log.info("Category from request: {}", request.getCategory());
        log.info("Request name: {}", request.getName());
        // Kiểm tra tên khoa đã tồn tại trong bệnh viện chưa
        if (departmentRepository.existsByNameAndHospitalId(request.getName(), hospitalId)) {
            throw new AppException(ErrorCode.DEPARTMENT_EXISTED);
        }
        // Kiểm tra mã khoa đã tồn tại trong bệnh viện chưa
        if (departmentRepository.existsByCodeAndHospitalId(request.getCode(), hospitalId)) {
            throw new AppException(ErrorCode.DEPARTMENT_EXISTED);
        }

        Department department = Department.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .category(request.getCategory())
                .hospitalId(hospitalId)
                .build();
        log.info("Category before save: {}", department.getCategory());
        Department saved = departmentRepository.save(department);

        log.info("Category after save: {}", saved.getCategory());

        return departmentMapper.toResponse(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponse updateForHospital(UUID id, DepartmentRequest request, UUID hospitalId) {
        Department department = departmentRepository.findByIdAndHospitalId(id, hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        // Kiểm tra tên trùng (trừ chính nó)
        if (departmentRepository.existsByNameAndHospitalIdAndIdNot(request.getName(), hospitalId, id)) {
            throw new AppException(ErrorCode.DEPARTMENT_EXISTED);
        }
        // Kiểm tra mã trùng (trừ chính nó)
        if (departmentRepository.existsByCodeAndHospitalIdAndIdNot(request.getCode(), hospitalId, id)) {
            throw new AppException(ErrorCode.DEPARTMENT_EXISTED);
        }

        department.setName(request.getName());
        department.setCode(request.getCode().toUpperCase());
        department.setDescription(request.getDescription());
        department.setCategory(request.getCategory());

        return departmentMapper.toResponse(departmentRepository.save(department));
    }

    @Transactional
    public void deleteForHospital(UUID id, UUID hospitalId) {
        Department department = departmentRepository.findByIdAndHospitalId(id, hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        // Kiểm tra xem có specialty nào thuộc khoa này không
        if (departmentRepository.hasSpecialties(id)) {
            throw new AppException(ErrorCode.DEPARTMENT_HAS_SPECIALTIES);
        }

        departmentRepository.delete(department);
    }
}