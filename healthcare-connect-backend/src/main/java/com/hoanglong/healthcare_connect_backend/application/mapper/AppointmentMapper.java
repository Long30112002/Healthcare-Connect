package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper extends BaseMapper<Appointment, AppointmentResponse> {
//    @Mapping(source = "patient.fullName", target = "patientName")
    @Mapping(source = "schedule.doctor.user.fullName", target = "doctorName")
    @Mapping(source = "schedule.doctor.hospital.name", target = "hospitalName")
    @Mapping(source = "schedule.doctor.id", target = "doctorId")
    @Mapping(source = "schedule.date", target = "appointmentDate")
    @Mapping(source = "schedule.startTime", target = "startTime")
    @Mapping(source = "schedule.endTime", target = "endTime")
    @Mapping(source = "schedule.price", target = "price")
    @Mapping(source = "paid", target = "isPaid")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "room.id", target = "roomId")
    @Mapping(source = "room.roomNumber", target = "roomNumber")
    @Mapping(source = "room.floor", target = "roomFloor")
    @Mapping(source = "patientPhone", target = "patientPhone")
    @Mapping(source = "bookingType", target = "bookingType")
    AppointmentResponse toResponse(Appointment appointment);

    @Override
    @Mapping(target = "id", ignore = true)
    Appointment toEntity(Object request);
}