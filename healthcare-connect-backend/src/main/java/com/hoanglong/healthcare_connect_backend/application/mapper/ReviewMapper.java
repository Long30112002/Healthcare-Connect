package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.review.ReviewResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(source = "patient.fullName", target = "patientName")
    @Mapping(source = "doctor.user.fullName", target = "doctorName")
    @Mapping(source = "appointment.id", target = "appointmentId")
    ReviewResponse toResponse(Review review);
}