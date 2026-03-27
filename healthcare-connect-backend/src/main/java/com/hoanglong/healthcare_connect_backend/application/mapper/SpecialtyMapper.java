package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.SpecialtyRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.SpecialtyResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {DepartmentMapper.class})
public interface SpecialtyMapper extends BaseMapper<Specialty, SpecialtyResponse> {

    // 1. Ghi đè (Override) lại hàm toEntity để xử lý trường hợp tạo mới
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Specialty toEntity(SpecialtyRequest request);

    // 2. Hàm toResponse sẽ tự động dùng implementation của BaseMapper
}