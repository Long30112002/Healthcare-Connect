//package com.hoanglong.healthcare_connect_backend.api.controller;
//
//import com.hoanglong.healthcare_connect_backend.application.dto.MomoPaymentResponse;
//import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
//import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
////import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.payment.PaymentProvider;
//import com.hoanglong.healthcare_connect_backend.core.repository.IScheduleRepository;
//import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
//import com.hoanglong.healthcare_connect_backend.infrastructure.payment.momo.MomoService;
//import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
//import lombok.RequiredArgsConstructor;
//import org.apache.commons.lang3.ObjectUtils;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.time.LocalDateTime;
//import java.util.Map;
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/api/v1/test-payment")
//@RequiredArgsConstructor
//public class TestPaymentController {
//
//    private final AppointmentRepository appointmentRepository;
//    private final IUserRepository userRepository;
//    private final IScheduleRepository scheduleRepository;
//    private final MomoService momoService;
//
//    @PostMapping("/quick-pay")
//    public ResponseEntity<?> createAndGetPayUrl() {
//        try {
//            // 1. Tìm User và Schedule (Đảm bảo DB đã có dữ liệu mồi)
//            var patient = userRepository.findAll().stream().findFirst()
//                    .orElseThrow(() -> new RuntimeException("DB chưa có User nào!"));
//            var schedule = scheduleRepository.findAll().stream().findFirst()
//                    .orElseThrow(() -> new RuntimeException("DB chưa có Schedule nào!"));
//
//            // 2. Khởi tạo Appointment
//            Appointment appointment = new Appointment();
//            // appointment.setId(UUID.randomUUID()); // Bỏ dòng này nếu dùng @GeneratedValue
//
//            appointment.setPatient(patient);
//            appointment.setSchedule(schedule);
//            appointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
//            appointment.setStatus(AppointmentStatus.AWAITING_PAYMENT);
//            appointment.setPaid(false);
//            appointment.setRescheduled(false);
//
//            // QUAN TRỌNG: Nếu bạn có trường tiền phí, hãy set ở đây
//            // appointment.setFee(new BigDecimal("100000"));
//
//            // 3. Lưu vào DB trước để có ID chính thức
//            Appointment savedApp = appointmentRepository.save(appointment);
//
//            // 4. Gọi MoMo lấy link
//            MomoPaymentResponse payUrl = momoService.createPaymentRequest(savedApp);
//
//            if (payUrl == null || ObjectUtils.isEmpty(payUrl)) {
//                return ResponseEntity.badRequest().body("MoMo không trả về link. Kiểm tra lại cấu hình key/signature!");
//            }
//
//            return ResponseEntity.ok(new QuickPayResponse(savedApp.getId(), payUrl));
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
//        }
//    }
//
//    // Class nội bộ để format JSON trả về cho đẹp
//    @lombok.Data
//    @lombok.AllArgsConstructor
//    static class QuickPayResponse {
//        private UUID appointmentId;
//        private String payUrl;
//    }
//}