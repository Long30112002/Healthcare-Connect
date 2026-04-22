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

    // Ánh xạ từ Request sang Entity để lưu vào DB
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "manager", ignore = true) // Manager sẽ được set thủ công trong Service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Hospital swallowRequestToHospital(HospitalRequest request); // Đổi tên cho rõ nghĩa hoặc để toHospital

    @Mapping(source = "manager.fullName", target = "managerEmail")
    HospitalResponse toHospitalResponse(Hospital hospital);

    List<HospitalResponse> toHospitalResponseList(List<Hospital> hospitals);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateHospital(@MappingTarget Hospital hospital, HospitalRequest request);
}
