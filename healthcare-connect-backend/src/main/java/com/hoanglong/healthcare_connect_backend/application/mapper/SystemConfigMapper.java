package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.system_config.SystemConfigResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.SystemConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SystemConfigMapper {

    SystemConfigResponse toResponse(SystemConfig entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    SystemConfig toEntity(SystemConfigResponse response);
}