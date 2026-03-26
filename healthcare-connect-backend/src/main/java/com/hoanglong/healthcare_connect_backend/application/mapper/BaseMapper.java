package com.hoanglong.healthcare_connect_backend.application.mapper;

import org.mapstruct.MappingTarget;

public interface BaseMapper<E, R> {
    R toResponse(E entity); // Chuyển Entity sang Response DTO
    E toEntity(Object request); // Chuyển Request DTO sang Entity
    void updateEntityFromRequest(@MappingTarget E entity, Object request);
}