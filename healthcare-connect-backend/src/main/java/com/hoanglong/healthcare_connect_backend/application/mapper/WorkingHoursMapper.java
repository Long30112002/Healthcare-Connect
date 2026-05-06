package com.hoanglong.healthcare_connect_backend.application.mapper;


import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalWorkingHours;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.WorkingHoursRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.WorkingHoursResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WorkingHoursMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "hospital", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    HospitalWorkingHours toEntity(WorkingHoursRequest request);

    @Mapping(source = "hospital.id", target = "hospitalId")
    @Mapping(source = "hospital.name", target = "hospitalName")
    @Mapping(source = "dayOfWeek", target = "dayName", qualifiedByName = "getDayName")
    WorkingHoursResponse toResponse(HospitalWorkingHours entity);

    List<WorkingHoursResponse> toResponseList(List<HospitalWorkingHours> entities);

    @Named("getDayName")
    default String getDayName(Integer dayOfWeek) {
        if (dayOfWeek == null) return null;
        return switch (dayOfWeek) {
            case 2 -> "Thứ 3";
            case 3 -> "Thứ 4";
            case 4 -> "Thứ 5";
            case 5 -> "Thứ 6";
            case 6 -> "Thứ 7";
            case 7 -> "Chủ nhật";
            case 8 -> "Thứ 2";
            default -> "Không xác định";
        };
    }
}