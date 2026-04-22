package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.hospital.DepartmentResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DepartmentMapper extends BaseMapper<Department, DepartmentResponse> {
    // MapStruct sẽ tự động hiểu cách chuyển từ Department sang DepartmentResponse
}