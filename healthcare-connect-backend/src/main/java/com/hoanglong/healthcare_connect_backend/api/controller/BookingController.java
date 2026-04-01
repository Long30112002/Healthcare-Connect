package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.BookingRequest;
import com.hoanglong.healthcare_connect_backend.application.usecase.BookAppointmentUseCase;
import lombok.AccessLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {

    BookAppointmentUseCase bookAppointmentUseCase;

    @PostMapping("/book")
    public ApiResponse<AppointmentResponse> book(@RequestBody BookingRequest request) {
        // Lấy ID người dùng từ SecurityContext (Token)
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID patientId = UUID.fromString(authentication.getName());

        return ApiResponse.<AppointmentResponse>builder()
                .data(bookAppointmentUseCase.execute(patientId, request.getScheduleId(), request.getSymptoms()))
                .build();
    }
}

