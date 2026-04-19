package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.MomoPaymentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.WalkInAppointmentRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.WalkInAppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.AppointmentMapper;
import com.hoanglong.healthcare_connect_backend.application.service.ReceptionistAuditLogService;
import com.hoanglong.healthcare_connect_backend.core.constant.*;
import com.hoanglong.healthcare_connect_backend.core.entity.*;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IPaymentRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IScheduleRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.payment.PaymentProvider;
import com.hoanglong.healthcare_connect_backend.infrastructure.payment.PaymentProviderFactory;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreateWalkInAppointmentUseCase {

    private final IScheduleRepository scheduleRepository;
    private final AppointmentRepository appointmentRepository;
    private final IPaymentRepository paymentRepository;
    private final PaymentProviderFactory paymentProviderFactory;
    private final AppointmentMapper appointmentMapper;
    private final ReceptionistAuditLogService receptionistAuditLogService;

    @Transactional
    public WalkInAppointmentResponse execute(WalkInAppointmentRequest request, HttpServletRequest httpRequest) {

        // 1. Lấy schedule có lock
        Schedule schedule = scheduleRepository.findByIdWithLock(request.getScheduleId())
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // 2. Validate schedule
        validateSchedule(schedule);

        // 3. Validate input
        validateInput(request);

        // 4. Xử lý theo phương thức thanh toán
        PaymentMethod method = request.getPaymentMethod();

        if (method == PaymentMethod.CASH) {
            return handleCashPayment(schedule, request, httpRequest);
        } else if (paymentProviderFactory.isSupported(method)) {
            return handleElectronicPayment(schedule, request, method, httpRequest);
        } else {
            throw new AppException(ErrorCode.UNSUPPORTED_PAYMENT_METHOD);
        }
    }

    private void validateSchedule(Schedule schedule) {
        if (schedule.getStatus() == ScheduleStatus.CANCELLED) {
            throw new AppException(ErrorCode.SCHEDULE_CANCELLED);
        }

        LocalDateTime minBookingTime = LocalDateTime.now().plusMinutes(30);
        if (schedule.getStartTime().isBefore(minBookingTime)) {
            throw new AppException(ErrorCode.BOOKING_TOO_LATE);
        }

        if (schedule.getStartTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.SCHEDULE_ALREADY_PASSED);
        }

        if (schedule.getCurrentBookings() >= schedule.getMaxPatients()) {
            schedule.setStatus(ScheduleStatus.FULL);
            scheduleRepository.save(schedule);
            throw new AppException(ErrorCode.WALK_IN_SCHEDULE_FULL);
        }
    }

    private void validateInput(WalkInAppointmentRequest request) {
        if (request.getPatientName() == null || request.getPatientName().trim().isEmpty()) {
            throw new AppException(ErrorCode.NAME_INVALID);
        }
        if (request.getPatientPhone() == null || request.getPatientPhone().trim().isEmpty()) {
            throw new AppException(ErrorCode.PHONE_INVALID);
        }
        if (!request.getPatientPhone().matches("^[0-9]{10,11}$")) {
            throw new AppException(ErrorCode.PHONE_INVALID);
        }
    }

    private WalkInAppointmentResponse handleCashPayment(Schedule schedule, WalkInAppointmentRequest request, HttpServletRequest httpRequest) {
        log.info("==> [WALK-IN CASH] Tạo lịch tiền mặt cho bệnh nhân: {}", request.getPatientName());

        // Tạo appointment
        Appointment appointment = createBaseAppointment(request, schedule, true, AppointmentStatus.CONFIRMED);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Tạo payment record
        createPaymentRecord(savedAppointment, schedule, PaymentStatus.SUCCESS, PaymentMethod.CASH);

        // Update slot
        updateSlot(schedule);

        receptionistAuditLogService.logCreateWalkIn(savedAppointment, PaymentMethod.CASH.name(), httpRequest);

        log.info("==> [WALK-IN CASH] Thành công! Appointment ID: {}", savedAppointment.getId());

        AppointmentResponse appointmentResponse = appointmentMapper.toResponse(savedAppointment);
        appointmentResponse.setPatientName(request.getPatientName());

        return WalkInAppointmentResponse.builder()
                .appointment(appointmentResponse)
                .paymentStatus(PaymentStatus.SUCCESS)
                .needPayment(false)
                .message("Đã tạo lịch và nhận tiền mặt thành công!")
                .build();
    }

    private WalkInAppointmentResponse handleElectronicPayment(Schedule schedule,
            WalkInAppointmentRequest request,
            PaymentMethod method,
            HttpServletRequest httpRequest) {
        log.info("==> [WALK-IN E-PAYMENT] Tạo lịch {} cho bệnh nhân: {}", method, request.getPatientName());

        // 1. Tạo appointment PENDING
        Appointment appointment = createBaseAppointment(request, schedule, false, AppointmentStatus.AWAITING_PAYMENT);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // 2. Tạo payment PENDING
        createPaymentRecord(savedAppointment, schedule, PaymentStatus.PENDING, method);

        // 3. Gọi provider để tạo payment link
        PaymentProvider provider = paymentProviderFactory.getProvider(method);
        MomoPaymentResponse paymentResponse = provider.createPaymentRequest(savedAppointment);

        receptionistAuditLogService.logCreateWalkIn(savedAppointment, method.name(), httpRequest);

        log.info("==> [WALK-IN E-PAYMENT] Đã tạo payment link: {}", paymentResponse.getPayUrl());
        AppointmentResponse appointmentResponse = appointmentMapper.toResponse(savedAppointment);
        appointmentResponse.setPatientName(request.getPatientName());

        return WalkInAppointmentResponse.builder()
                .appointment(appointmentResponse)
                .paymentStatus(PaymentStatus.PENDING)
                .payUrl(paymentResponse.getPayUrl())
                .qrCodeUrl(paymentResponse.getQrCodeUrl())
                .deeplink(paymentResponse.getDeeplink())
                .needPayment(true)
                .message("Vui lòng cho bệnh nhân quét QR để thanh toán")
                .build();
    }

    private Appointment createBaseAppointment(WalkInAppointmentRequest request,
            Schedule schedule,
            boolean isPaid,
            AppointmentStatus status) {
        return Appointment.builder()
                .patient(null)
                .patientName(request.getPatientName().trim())
                .patientPhone(request.getPatientPhone().trim())
                .schedule(schedule)
                .appointmentDate(LocalDateTime.now())
                .status(status)
                .isPaid(isPaid)
                .symptoms(request.getSymptoms() != null ? request.getSymptoms().trim() : null)
                .bookingType(BookingType.WALK_IN)
                .build();
    }

    private Payment createPaymentRecord(Appointment appointment,
            Schedule schedule,
            PaymentStatus paymentStatus,
            PaymentMethod method) {
        Payment payment = Payment.builder()
                .appointment(appointment)
                .paymentMethod(method)
                .amount(schedule.getPrice())
                .status(paymentStatus)
                .transactionNo(generateTransactionNo())
                .createdAt(LocalDateTime.now())
                .build();

        return paymentRepository.save(payment);
    }

    private void updateSlot(Schedule schedule) {
        int newBookingCount = schedule.getCurrentBookings() + 1;
        schedule.setCurrentBookings(newBookingCount);

        if (newBookingCount >= schedule.getMaxPatients()) {
            schedule.setStatus(ScheduleStatus.FULL);
        }

        scheduleRepository.save(schedule);
        log.info("==> [SLOT] Schedule {}: currentBookings = {}/{}",
                schedule.getId(), newBookingCount, schedule.getMaxPatients());
    }

    private String generateTransactionNo() {
        return "WALKIN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}