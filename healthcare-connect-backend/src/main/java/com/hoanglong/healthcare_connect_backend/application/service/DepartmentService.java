package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.application.dto.DepartmentResponse;
import com.hoanglong.healthcare_connect_backend.core.repository.DepartmentRepository;
import com.hoanglong.healthcare_connect_backend.application.mapper.DepartmentMapper;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DepartmentService extends BaseService<Department, DepartmentResponse, String> {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    @Override
    protected JpaRepository<Department, String> getRepository() {
        return departmentRepository;
    }

    @Override
    protected BaseMapper<Department, DepartmentResponse> getMapper() {
        return departmentMapper;
    }

    @Override
    protected ErrorCode getNotFoundErrorCode() {
        return ErrorCode.DEPARTMENT_NOT_FOUND;
    }

    @Override
    protected ErrorCode getAlreadyExistsErrorCode() {
        return ErrorCode.DEPARTMENT_EXISTED;
    }
}