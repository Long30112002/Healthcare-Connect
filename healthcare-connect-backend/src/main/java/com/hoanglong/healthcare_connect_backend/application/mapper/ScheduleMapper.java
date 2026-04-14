package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.ScheduleRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.ScheduleResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ScheduleMapper{
    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "doctor.user.fullName", target = "doctorName")
    @Mapping(source = "room.id", target = "roomId")
    @Mapping(source = "room.roomNumber", target = "roomNumber")
    @Mapping(source = "room.floor", target = "roomFloor")
    ScheduleResponse toResponse(Schedule schedule);
}