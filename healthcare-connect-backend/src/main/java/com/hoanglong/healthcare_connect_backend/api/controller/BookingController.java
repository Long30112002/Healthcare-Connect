package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.BookingRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.CancelAppointmentRequest;
import com.hoanglong.healthcare_connect_backend.application.service.AppointmentService;
import com.hoanglong.healthcare_connect_backend.application.usecase.BookAppointmentUseCase;
import lombok.AccessLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {

    BookAppointmentUseCase bookAppointmentUseCase;
    AppointmentService appointmentService;

    @PostMapping("/book")
    public ApiResponse<AppointmentResponse> book(@RequestBody BookingRequest request) {
        // Lấy ID người dùng từ SecurityContext (Token)
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID patientId = UUID.fromString(authentication.getName());

        return ApiResponse.<AppointmentResponse>builder()
                .data(bookAppointmentUseCase.execute(patientId, request.getScheduleId(), request.getSymptoms()))
                .build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelAppointment(
            @PathVariable("id") UUID appointmentId,
            @RequestBody CancelAppointmentRequest request) {

        log.info("==> [REQUEST] Hủy lịch hẹn: {}, Lý do: {}", appointmentId, request.getReason());

        appointmentService.cancelAndRefund(appointmentId, request.getReason());

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .message("Hủy lịch và hoàn tiền thành công!")
                .data("Lịch hẹn " + appointmentId + " đã được xử lý hoàn tiền.")
                .build());
    }
}

