package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DoctorMapper {

    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.phone", target = "phone")
    @Mapping(source = "specialty.name", target = "specialtyName")
    @Mapping(source = "department.name", target = "departmentName")
    @Mapping(source = "hospital.name", target = "hospitalName")
    @Mapping(source = "hospital.id", target = "hospitalId")
    @Mapping(source = "hospital.address", target = "hospitalAddress")
    DoctorResponse toDoctorResponse(Doctor doctor);

    List<DoctorResponse> toDoctorResponseList(List<Doctor> doctors);
}