package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface HospitalMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "invitationToken", ignore = true)
    @Mapping(target = "tokenExpiry", ignore = true)
    @Mapping(target = "tempManagerEmail", ignore = true)
    @Mapping(source = "hotline", target = "hotline")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "website", target = "website")
    Hospital swallowRequestToHospital(HospitalRequest request);

    @Mapping(source = "manager.fullName", target = "managerEmail")
    @Mapping(source = "hotline", target = "hotline")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "website", target = "website")
    HospitalResponse toHospitalResponse(Hospital hospital);

    List<HospitalResponse> toHospitalResponseList(List<Hospital> hospitals);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "invitationToken", ignore = true)
    @Mapping(target = "tokenExpiry", ignore = true)
    @Mapping(target = "tempManagerEmail", ignore = true)
    @Mapping(source = "hotline", target = "hotline")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "website", target = "website")
    void updateHospital(@MappingTarget Hospital hospital, HospitalRequest request);
}
