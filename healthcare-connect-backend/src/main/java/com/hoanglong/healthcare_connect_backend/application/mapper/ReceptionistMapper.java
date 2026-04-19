package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.ReceptionistListResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.ReceptionistResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReceptionistMapper {

    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.phone", target = "phone")
    @Mapping(source = "hospital.name", target = "hospitalName")
    @Mapping(source = "hospital.address", target = "hospitalAddress")
    ReceptionistResponse toResponse(Receptionist receptionist);

    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.phone", target = "phone")
    @Mapping(source = "hospital.name", target = "hospitalName")
    ReceptionistListResponse toListResponse(Receptionist receptionist);
}