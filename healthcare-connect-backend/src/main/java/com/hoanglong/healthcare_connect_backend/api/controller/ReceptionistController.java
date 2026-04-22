package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.appointment.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.appointment.WalkInAppointmentRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.appointment.WalkInAppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorDetailResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorListResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.payment.MomoPaymentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.receptionist.ReceptionistCancelRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.receptionist.ReceptionistProfileRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.receptionist.ReceptionistResponse;
import com.hoanglong.healthcare_connect_backend.application.service.CurrentUserService;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorService;
import com.hoanglong.healthcare_connect_backend.application.service.ReceptionistService;
import com.hoanglong.healthcare_connect_backend.application.usecase.CreateWalkInAppointmentUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.ProcessRefundUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.RegisterReceptionistProfileUseCase;
import com.hoanglong.healthcare_connect_backend.core.constant.PaymentStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Payment;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.payment.momo.MomoService;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.PaymentRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/receptionist")
@RequiredArgsConstructor
public class ReceptionistController {
    private final ReceptionistService receptionistService;
    private final DoctorService doctorService;
    private final PaymentRepository paymentRepository;
    private final CreateWalkInAppointmentUseCase createWalkInAppointmentUseCase;
    private final MomoService momoService;
    private final ProcessRefundUseCase processRefundUseCase;
    private final RegisterReceptionistProfileUseCase registerReceptionistProfileUseCase;
    private final CurrentUserService currentUserService;


    @PostMapping("/apply")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ReceptionistResponse> apply(
            @ModelAttribute @Valid ReceptionistProfileRequest request,
            HttpServletRequest httpRequest) {

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        ReceptionistResponse response = registerReceptionistProfileUseCase.execute(currentUserId, request, httpRequest);

        return ApiResponse.<ReceptionistResponse>builder()
                .status("success")
                .code(200)
                .message("Nộp hồ sơ thành công! Vui lòng chờ admin xác thực.")
                .data(response)
                .build();
    }

    @GetMapping("/current-hospital")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<HospitalResponse> getCurrentHospital() {
        HospitalResponse response = currentUserService.getCurrentHospital();
        return ApiResponse.<HospitalResponse>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }

    @GetMapping("/doctors/{doctorId}/schedules")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<DoctorDetailResponse> getDoctorSchedules(@PathVariable UUID doctorId) {
        UUID hospitalId = currentUserService.getCurrentReceptionistHospitalId();

        return ApiResponse.<DoctorDetailResponse>builder()
                .status("success")
                .code(200)
                .data(doctorService.getDoctorDetailForReceptionist(doctorId, hospitalId))
                .build();
    }

    // Lấy danh sách lịch hẹn hôm nay
    @GetMapping("/appointments/today")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<List<AppointmentResponse>> getTodayAppointments() {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .status("success")
                .code(200)
                .message("Lấy danh sách lịch hẹn thành công")
                .data(receptionistService.getTodayAppointments())
                .build();
    }

    @PostMapping("/walk-in")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<WalkInAppointmentResponse> createWalkInAppointment(
            @RequestBody @Valid WalkInAppointmentRequest request,
            HttpServletRequest httpRequest) {

        UUID hospitalId = currentUserService.getCurrentReceptionistHospitalId();
        WalkInAppointmentResponse response = createWalkInAppointmentUseCase.execute(request, httpRequest, hospitalId);
        return ApiResponse.<WalkInAppointmentResponse>builder()
                .status("success")
                .code(200)
                .message(response.getMessage())
                .data(response)
                .build();
    }

    @PostMapping("/appointments/{appointmentId}/cancel")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<String> cancelAppointment(
            @PathVariable UUID appointmentId,
            @RequestBody @Valid ReceptionistCancelRequest request,
            HttpServletRequest httpRequest) {

        processRefundUseCase.execute(appointmentId, request, httpRequest);

        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .message("Hủy lịch thành công!")
                .data("Lịch hẹn " + appointmentId + " đã được hủy")
                .build();
    }

    @GetMapping("/payments/{appointmentId}/qr")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<MomoPaymentResponse> getPaymentQR(@PathVariable UUID appointmentId) {
        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
        }

        MomoPaymentResponse response = momoService.createPaymentRequest(payment.getAppointment());

        return ApiResponse.<MomoPaymentResponse>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }

    // Tìm kiếm lịch hẹn
    @GetMapping("/appointments/search")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<List<AppointmentResponse>> searchAppointments(
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .status("success")
                .code(200)
                .message("Tìm kiếm thành công")
                .data(receptionistService.searchAppointments(keyword))
                .build();
    }

    // Check-in bệnh nhân (thủ công)
    @PatchMapping("/appointments/{appointmentId}/check-in")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<String> manualCheckIn(
            @PathVariable UUID appointmentId,
            HttpServletRequest httpRequest) {
        // Tái sử dụng method checkIn đã có
        receptionistService.checkIn(appointmentId, httpRequest);
        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .message("Check-in thành công!")
                .data("Bệnh nhân đã được check-in")
                .build();
    }

    @GetMapping("/doctors/available")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<List<DoctorListResponse>> getAvailableDoctors(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) Integer days
    ) {
        UUID hospitalId = currentUserService.getCurrentReceptionistHospitalId();
        return ApiResponse.<List<DoctorListResponse>>builder()
                .status("success")
                .code(200)
                .data(doctorService.getAvailableDoctorsByHospital(date, days, hospitalId))
                .build();
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<Page<AppointmentResponse>> getAppointments(
            @RequestParam(defaultValue = "today") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("schedule.startTime").ascending());
        UUID hospitalId = currentUserService.getCurrentReceptionistHospitalId();
        return ApiResponse.<Page<AppointmentResponse>>builder()
                .status("success")
                .code(200)
                .data(receptionistService.getAppointments(filter, pageable, hospitalId))
                .build();
    }

    @GetMapping("/payments/{appointmentId}/status")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<Map<String, String>> getPaymentStatus(@PathVariable UUID appointmentId) {

        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        Map<String, String> response = new HashMap<>();
        response.put("paymentStatus", payment.getStatus().name());
        response.put("isPaid", String.valueOf(payment.getAppointment().isPaid()));

        return ApiResponse.<Map<String, String>>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }
}