package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.DepartmentRequest;
import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.application.dto.DepartmentResponse;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaDepartmentRepository;
import com.hoanglong.healthcare_connect_backend.application.mapper.DepartmentMapper;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class DepartmentService extends BaseService<Department, DepartmentRequest, DepartmentResponse, UUID> {

    private final JpaDepartmentRepository jpaDepartmentRepository;
    private final DepartmentMapper departmentMapper;

    public DepartmentService(JpaDepartmentRepository jpaDepartmentRepository, DepartmentMapper departmentMapper) {
        super(ErrorCode.DEPARTMENT_NOT_FOUND, ErrorCode.DEPARTMENT_EXISTED);
        this.jpaDepartmentRepository = jpaDepartmentRepository;
        this.departmentMapper = departmentMapper;
    }

    @Override
    protected JpaRepository<Department, UUID> getRepository() {
        return jpaDepartmentRepository;
    }

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

    // Không cần viết thêm bất cứ hàm lấy danh sách hay xóa khoa nào nữa.

    // Hàm Tạo mới (Create) - Vì BaseService chưa có hàm Save chung
    public DepartmentResponse create(DepartmentRequest request) {
        // 1. Chuyển DTO sang Entity (Chỗ này mới chạy toUpperCase cho code nè)
        Department entity = mapToEntity(request);

        // 2. Kiểm tra trùng mã (Nếu cần)
        if (jpaDepartmentRepository.existsByCode(entity.getCode())) {
            throw new AppException(ErrorCode.DEPARTMENT_EXISTED);
        }

        return departmentMapper.toResponse(jpaDepartmentRepository.save(entity));
    }

    public DepartmentResponse update(UUID id, DepartmentRequest request) {
        Department department = jpaDepartmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        department.setName(request.getName());
        department.setCode(request.getCode().toUpperCase()); // Cập nhật cả code
        department.setDescription(request.getDescription());

        return departmentMapper.toResponse(jpaDepartmentRepository.save(department));
    }
}