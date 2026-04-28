package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.appointment.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.appointment.BookingRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.appointment.CancelAppointmentRequest;
import com.hoanglong.healthcare_connect_backend.application.mapper.AppointmentMapper;
import com.hoanglong.healthcare_connect_backend.application.service.AppointmentService;
import com.hoanglong.healthcare_connect_backend.application.usecase.CreateBookAppointmentUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.ProcessRefundUseCase;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppointmentController
{
    private final CreateBookAppointmentUseCase createBookAppointmentUseCase;
    private final AppointmentService appointmentService;
    private final ProcessRefundUseCase processRefundUseCase;
    private final AppointmentMapper appointmentMapper;
    private final AppointmentRepository appointmentRepository;

    @GetMapping("/my-bookings")
    @PreAuthorize("hasAnyRole('PATIENT')")
    public ApiResponse<Page<AppointmentResponse>> getMyAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID patientId = UUID.fromString(authentication.getName());
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").descending());
        return ApiResponse.<Page<AppointmentResponse>>builder()
                .status("success")
                .code(200)
                .message("Lấy danh sách lịch hẹn thành công")
                .data(appointmentService.getPatientAppointments(patientId, pageable))
                .build();
    }

    @PostMapping("/book")
    @PreAuthorize("hasAnyRole('PATIENT')")
    public ApiResponse<AppointmentResponse> book(@RequestBody BookingRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID patientId = UUID.fromString(authentication.getName());

        return ApiResponse.<AppointmentResponse>builder()
                .data(createBookAppointmentUseCase.execute(patientId, request.getScheduleId(), request.getSymptoms()))
                .build();
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('PATIENT')")
    public ResponseEntity<ApiResponse<String>> cancelAppointment(
            @PathVariable("id") UUID appointmentId,
            @RequestBody CancelAppointmentRequest request) {

        log.info("==> [REQUEST] Hủy lịch hẹn: {}, Lý do: {}", appointmentId, request.getReason());

        processRefundUseCase.execute(appointmentId, request.getReason());

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .message("Hủy lịch và hoàn tiền thành công!")
                .data("Lịch hẹn " + appointmentId + " đã được xử lý hoàn tiền.")
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'RECEPTIONIST', 'ADMIN', 'HOSPITAL_MANAGER')")
    public ApiResponse<AppointmentResponse> getAppointmentById(@PathVariable UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

        AppointmentResponse response = appointmentMapper.toResponse(appointment);

        return ApiResponse.<AppointmentResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin lịch hẹn thành công!")
                .data(response)
                .build();
    }
}

