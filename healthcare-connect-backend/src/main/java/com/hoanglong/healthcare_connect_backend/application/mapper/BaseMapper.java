package com.hoanglong.healthcare_connect_backend.application.mapper;

import org.mapstruct.MappingTarget;

public interface BaseMapper<E, R> {
    R toResponse(E entity);
    E toEntity(Object request);
}