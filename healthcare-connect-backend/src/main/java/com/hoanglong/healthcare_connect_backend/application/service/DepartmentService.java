package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.application.dto.DepartmentResponse;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.repository.DepartmentRepository;
import com.hoanglong.healthcare_connect_backend.application.mapper.DepartmentMapper;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class DepartmentService extends BaseService<Department, DepartmentResponse, UUID> {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    public DepartmentService(DepartmentRepository departmentRepository, DepartmentMapper departmentMapper) {
        super(ErrorCode.DEPARTMENT_NOT_FOUND, ErrorCode.DEPARTMENT_EXISTED);
        this.departmentRepository = departmentRepository;
        this.departmentMapper = departmentMapper;
    }

    @Override
    protected JpaRepository<Department, UUID> getRepository() {
        return departmentRepository;
    }

    @Override
    protected BaseMapper<Department, DepartmentResponse> getMapper() {
        return departmentMapper;
    }

    // Không cần viết thêm bất cứ hàm lấy danh sách hay xóa khoa nào nữa.

    // Hàm Tạo mới (Create) - Vì BaseService chưa có hàm Save chung
    public DepartmentResponse create(Department request) {
        if (request.getId() != null) {
            checkExistBeforeCreate(request.getId());
        }
        return departmentMapper.toResponse(departmentRepository.save(request));
    }

    // Hàm Cập nhật (Update)
    public DepartmentResponse update(UUID id, Department request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        return departmentMapper.toResponse(departmentRepository.save(department));
    }
}