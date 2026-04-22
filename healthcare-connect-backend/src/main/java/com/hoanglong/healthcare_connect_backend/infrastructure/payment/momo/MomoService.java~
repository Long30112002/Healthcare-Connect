package com.hoanglong.healthcare_connect_backend.infrastructure.payment.momo;

import com.hoanglong.healthcare_connect_backend.application.dto.MomoPaymentResponse;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.application.service.NotificationService;
import com.hoanglong.healthcare_connect_backend.core.constant.*;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Payment;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.payment.PaymentProvider;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.PaymentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.cloudinary.json.JSONObject;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "payment.momo.enabled", havingValue = "true")
public class MomoService implements PaymentProvider
{
    private final MomoConfig momoConfig;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final MailService mailService;
    private final NotificationService notificationService;
    private final ScheduleRepository scheduleRepository;
    private static final String REQUEST_TYPE = "captureWallet";

    @Override
    public MomoPaymentResponse createPaymentRequest(Appointment appointment) {
        try {
            // Lấy dữ liệu từ object momoConfig
            String partnerCode = momoConfig.getPartnerCode();
            String accessKey = momoConfig.getAccessKey();
            String secretKey = momoConfig.getSecretKey();
            String endpoint = momoConfig.getEndpoint();
            String returnUrl = momoConfig.getReturnUrl();
            String notifyUrl = momoConfig.getNotifyUrl();

            // XỬ LÝ AMOUNT: Ép BigDecimal về long
            BigDecimal price = appointment.getSchedule().getPrice();
            long amountLong = price.longValue();
            String amountStr = String.valueOf(amountLong);

            // Tạo requestId và orderId
            String requestId = partnerCode + System.currentTimeMillis();
            String orderId = appointment.getId().toString() + "_" + System.currentTimeMillis();
            String orderInfo = "Thanh toan lich hen " + appointment.getId().toString().substring(0, 8);
            String extraData = "";

            // 1. TẠO CHUỖI BĂM (RAW SIGNATURE)
            String rawSignature = String.format(
                    "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                    accessKey, amountStr, extraData, notifyUrl, orderId, orderInfo, partnerCode, returnUrl,
                    requestId, REQUEST_TYPE);

            log.debug("RAW SIGNATURE: {}", rawSignature);

            // 2. KÝ CHỮ KÝ
            String signature = signHmacSHA256(rawSignature, secretKey);
            log.debug("SIGNATURE: {}", signature);

            // 3. TẠO JSON BODY
            JSONObject requestBody = new JSONObject();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amountLong);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", returnUrl);
            requestBody.put("ipnUrl", notifyUrl);
            requestBody.put("extraData", extraData);
            requestBody.put("requestType", REQUEST_TYPE);
            requestBody.put("signature", signature);
            requestBody.put("lang", "vi");

            // 4. GỬI REQUEST BẰNG HttpClient
            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost httpPost = new HttpPost(endpoint);
                httpPost.setHeader("Content-Type", "application/json");
                httpPost.setEntity(new StringEntity(requestBody.toString(), StandardCharsets.UTF_8));

                try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                    String result = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                    JSONObject responseJson = new JSONObject(result);

                    if (responseJson.has("payUrl")) {
                        String payUrl = responseJson.getString("payUrl");
                        log.info("==> [MOMO] Tạo link thành công: {}", payUrl);

                        // TRẢ VỀ DTO ĐẦY ĐỦ
                        return MomoPaymentResponse.builder()
                                .payUrl(payUrl)
                                .qrCodeUrl(generateQRCodeUrl(payUrl))
                                .deeplink(generateDeeplink(payUrl))
                                .build();
                    } else {
                        // Nếu MoMo trả về lỗi (như sai Key, sai Signature...)
                        log.error("==> [MOMO ERROR] Phản hồi lỗi: {}", result);
                        throw new AppException(ErrorCode.PAYMENT_ERROR);
                    }
                }
            }
        } catch (Exception e) {
            log.error("==> [MOMO ERROR] Tạo payment request thất bại: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.PAYMENT_ERROR);
        }
    }

    private String generateQRCodeUrl(String payUrl) {
        try {
            return "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data="
                    + URLEncoder.encode(payUrl, StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            log.error("Failed to generate QR code URL: {}", e.getMessage());
            return "";
        }
    }


    private String generateDeeplink(String payUrl) {
        try {
            return "momo://payment?url=" + URLEncoder.encode(payUrl, StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            log.error("Failed to generate deeplink: {}", e.getMessage());
            return payUrl; // fallback to payUrl
        }
    }

    private String signHmacSHA256(String data, String key) throws Exception {
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
        byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);

        Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(keyBytes, "HmacSHA256");
        hmacSHA256.init(secretKeySpec);

        byte[] hash = hmacSHA256.doFinal(dataBytes);

        // Sử dụng Formatter để đảm bảo chuỗi Hex chuẩn xác
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }

    @Transactional
    public void processIPN(Map<String, String> params) {
        log.info("==> [MOMO IPN] Start verify OrderId: {}", params.get("orderId"));

        String mSignature = params.get("signature");

        try {
            // ===== 1. LẤY PARAMS =====
            String accessKey = momoConfig.getAccessKey();
            String amount = params.getOrDefault("amount", "");
            String extraData = params.getOrDefault("extraData", "");
            String message = params.getOrDefault("message", "");
            String orderId = params.getOrDefault("orderId", "");
            String orderInfo = params.getOrDefault("orderInfo", "");
            String orderType = params.getOrDefault("orderType", "");
            String partnerCode = params.getOrDefault("partnerCode", "");
            String payType = params.getOrDefault("payType", "");
            String requestId = params.getOrDefault("requestId", "");
            String responseTime = params.getOrDefault("responseTime", "");
            String resultCode = params.getOrDefault("resultCode", "");
            String transId = params.getOrDefault("transId", "");

            // ===== 2. BUILD RAW SIGNATURE =====
            String rawSignature =
                    "accessKey=" + accessKey +
                            "&amount=" + amount +
                            "&extraData=" + extraData +
                            "&message=" + message +
                            "&orderId=" + orderId +
                            "&orderInfo=" + orderInfo +
                            "&orderType=" + orderType +
                            "&partnerCode=" + partnerCode +
                            "&payType=" + payType +
                            "&requestId=" + requestId +
                            "&responseTime=" + responseTime +
                            "&resultCode=" + resultCode +
                            "&transId=" + transId;

            log.info("==> [RAW] {}", rawSignature);

            String mySignature = signHmacSHA256(rawSignature, momoConfig.getSecretKey());

            log.info("==> [SIGNATURE] MoMo: {}", mSignature);
            log.info("==> [SIGNATURE] Mine: {}", mySignature);

            // ===== 3. VERIFY SIGNATURE =====
            if (!mySignature.equalsIgnoreCase(mSignature)) {
                log.error("==> [SECURITY] Invalid signature!");
                throw new AppException(ErrorCode.PAYMENT_ERROR);
            }

            // ===== 4. CHECK PARTNER =====
            if (!momoConfig.getPartnerCode().equals(partnerCode)) {
                log.error("==> [SECURITY] Invalid partnerCode!");
                throw new AppException(ErrorCode.PAYMENT_ERROR);
            }

            // ===== 5. VALIDATE ORDER ID =====
            if (orderId == null || !orderId.contains("_")) {
                log.error("==> [SECURITY] Invalid orderId format!");
                throw new AppException(ErrorCode.PAYMENT_ERROR);
            }

            UUID appointmentId = UUID.fromString(orderId.split("_")[0]);

            // ===== 6. LOAD APPOINTMENT (LOCK) =====
            Appointment appointment = appointmentRepository.findByIdWithLock(appointmentId)
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

            // CHẶN CALLBACK KHI APPOINTMENT ĐÃ HỦY ==========
            if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
                log.warn("==> [MOMO IPN] Appointment already cancelled, ignoring payment callback. AppointmentId: {}", appointmentId);
                return; // Không xử lý thanh toán
            }

            // THÊM KIỂM TRA: CHẶN CALLBACK KHI ĐÃ QUÁ GIỜ KHÁM ==========
            if (appointment.getSchedule().getStartTime().isBefore(LocalDateTime.now())) {
                log.warn("==> [MOMO IPN] Appointment already passed, ignoring payment callback. AppointmentId: {}", appointmentId);
                return; // Không xử lý thanh toán
            }

            // ===== 7. CHECK AMOUNT =====
            BigDecimal momoAmount = new BigDecimal(amount);
            BigDecimal realAmount = appointment.getSchedule().getPrice();

            if (momoAmount.compareTo(realAmount) != 0) {
                log.error("==> [SECURITY] Amount mismatch! momo={}, system={}", momoAmount, realAmount);
                throw new AppException(ErrorCode.PAYMENT_ERROR);
            }

            // ===== 8. CHECK DUPLICATE TRANSACTION =====
            if (paymentRepository.existsByTransactionNo(transId)) {
                log.warn("==> [DUPLICATE] Transaction already processed: {}", transId);
                return;
            }

            // ===== 9. CHECK RESULT =====
            if (!"0".equals(resultCode)) {
                log.warn("==> [MOMO] Payment failed | orderId={} | resultCode={}", orderId, resultCode);
                return;
            }

            // ===== 10. CHECK STATUS =====
            if (appointment.isPaid()) {
                log.warn("==> [SKIP] Already paid: {}", appointment.getId());
                return;
            }

            // ===== 11. UPDATE DB (gọi method riêng) =====
            updateAppointmentStatus(appointment, params, transId);

            // ===== 12. AUDIT LOG =====
            log.info("==> [SUCCESS] Payment success | orderId={} | transId={} | amount={} | bookingType={}",
                    orderId, transId, amount, appointment.getBookingType());

        } catch (Exception e) {
            log.error("==> [ERROR] IPN processing failed: {}", e.getMessage());
            throw new AppException(ErrorCode.PAYMENT_ERROR);
        }
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.MOMO;
    }

    private void updateAppointmentStatus(Appointment appointment, Map<String, String> params, String transId) {
        // 1. Cập nhật Appointment
        appointment.setPaid(true);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);

        // 2. Tạo hoặc cập nhật bản ghi Payment
        Payment payment = paymentRepository.findByAppointmentId(appointment.getId())
                .orElseGet(() -> Payment.builder()
                        .appointment(appointment)
                        .hospital(appointment.getHospital())
                        .doctor(appointment.getDoctor())
                        .build());

        payment.setTransactionNo(transId);
        payment.setAmount(new BigDecimal(params.get("amount")));
        payment.setPaymentMethod(PaymentMethod.MOMO); 
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setCreatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // 3. GỬI EMAIL - CHỈ GỬI NẾU CÓ PATIENT (ONLINE)
        if (appointment.getPatient() != null) {
            try {
                mailService.sendPaymentSuccessEmail(appointment);
                log.info("==> [MAIL] Payment success email sent for appointment: {}", appointment.getId());
            } catch (Exception e) {
                log.error("==> [MAIL ERROR] Failed to send payment email: {}", e.getMessage());
            }
        } else {
            log.info("==> [MAIL] Skip email for walk-in appointment: {}", appointment.getId());
        }

        // 4. NẾU LÀ WALK-IN, TRỪ SLOT
        BookingType bookingType = appointment.getBookingType();
        if (bookingType == null) {
            bookingType = BookingType.ONLINE;
            log.warn("==> [MOMO] BookingType was null, set to ONLINE for appointment: {}", appointment.getId());
        }

        // 5. NẾU LÀ WALK-IN, TRỪ SLOT
        if (bookingType == BookingType.WALK_IN) {
            Schedule schedule = appointment.getSchedule();
            Schedule lockedSchedule = scheduleRepository.findByIdWithLock(schedule.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

            int newBookingCount = lockedSchedule.getCurrentBookings() + 1;
            lockedSchedule.setCurrentBookings(newBookingCount);

            if (newBookingCount >= lockedSchedule.getMaxPatients()) {
                lockedSchedule.setStatus(ScheduleStatus.FULL);
            }
            scheduleRepository.save(lockedSchedule);

            log.info("==> [WALK-IN MOMO] Đã trừ slot cho schedule: {}", lockedSchedule.getId());
        }


        // 6. Gửi WebSocket thông báo (dùng biến bookingType đã xử lý)
        Map<String, Object> socketData = new HashMap<>();
        socketData.put("appointmentId", appointment.getId());
        socketData.put("status", "PAID");
        socketData.put("bookingType", bookingType.name());
        socketData.put("message", bookingType == BookingType.WALK_IN
                ? "Thanh toán walk-in thành công!"
                : "Thanh toán thành công!");

        String topic = bookingType == BookingType.WALK_IN
                ? "/topic/receptionist/payment/" + appointment.getId()
                : "/topic/payment/" + appointment.getId();

        notificationService.sendRealtimeNotification(topic, socketData);

        log.info("==> [SUCCESS] Đã cập nhật và phát tín hiệu realtime cho đơn hàng: {}, type: {}",
                appointment.getId(), bookingType);
    }

    public JSONObject refundTransaction(Payment payment, long amount, String description) {
        try {
            String endpoint = "https://test-payment.momo.vn/v2/gateway/api/refund";
            String partnerCode = momoConfig.getPartnerCode();
            String accessKey = momoConfig.getAccessKey();
            String secretKey = momoConfig.getSecretKey();

            String requestId = partnerCode + System.currentTimeMillis();
            // Dùng requestId làm orderId cho giao dịch hoàn tiền
            String orderId = "RE_" + System.currentTimeMillis();
            String transIdStr = payment.getTransactionNo();

            // 1. TẠO CHUỖI RAW SIGNATURE
            String rawSignature = String.format(
                    "accessKey=%s&amount=%s&description=%s&orderId=%s&partnerCode=%s&requestId=%s&transId=%s",
                    accessKey, amount, description, orderId, partnerCode, requestId, transIdStr
            );

            String signature = signHmacSHA256(rawSignature, secretKey);

            // 2. TẠO JSON BODY
            JSONObject requestBody = new JSONObject();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount); // Số tiền thực tế muốn hoàn (50% hoặc 100%)
            requestBody.put("orderId", orderId);
            requestBody.put("description", description);
            requestBody.put("transId", Long.parseLong(transIdStr));
            requestBody.put("signature", signature);
            requestBody.put("lang", "vi");

            // 3. GỬI REQUEST
            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost httpPost = new HttpPost(endpoint);
                httpPost.setHeader("Content-Type", "application/json");
                httpPost.setEntity(new StringEntity(requestBody.toString(), StandardCharsets.UTF_8));

                try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                    String result = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                    return new JSONObject(result);
                }
            }
        } catch (Exception e) {
            log.error("==> [MOMO REFUND ERROR] {}", e.getMessage());
            return null;
        }
    }
}

//    @Transactional
//    public void processIPN(Map<String, String> params) {
//        log.info("==> [STEP 1] Nhận IPN Params: {}", params);
//        // 1. Lấy chữ ký MoMo gửi sang
//        String mSignature = params.get("signature");
//
//
//        // Lấy dữ liệu và xử lý chuỗi rỗng để tránh lỗi băm
//        String accessKey = momoConfig.getAccessKey();
//        String amount = params.getOrDefault("amount", "");
//        String extraData = params.getOrDefault("extraData", "");
//        String message = params.getOrDefault("message", "");
//        String orderId = params.getOrDefault("orderId", "");
//        String orderInfo = params.getOrDefault("orderInfo", "");
//        String partnerCode = params.getOrDefault("partnerCode", "");
//        String requestId = params.getOrDefault("requestId", "");
//        String responseTime = params.getOrDefault("responseTime", "");
//        String resultCode = params.getOrDefault("resultCode", "");
//        String transId = params.getOrDefault("transId", "");
//
//        // 2. Xây dựng chuỗi băm - Kiểm tra kỹ từng ký tự nối &
//        String rawSignature = "accessKey=" + accessKey +
//                "&amount=" + amount +
//                "&extraData=" + extraData +
//                "&message=" + message +
//                "&orderId=" + orderId +
//                "&orderInfo=" + orderInfo +
//                "&partnerCode=" + partnerCode +
//                "&requestId=" + requestId +
//                "&responseTime=" + responseTime +
//                "&resultCode=" + resultCode +
//                "&transId=" + transId;
//
//        log.info("==> [STEP 2] Chuỗi Raw IPN (System): {}", rawSignature);
//
//        try {
//            // 3. Kiểm tra Secret Key (Chỉ log 4 ký tự đầu/cuối để bảo mật)
//            String sKey = momoConfig.getSecretKey();
//            log.info("==> [STEP 3] Secret Key đang dùng: {}...{}", sKey.substring(0, 4), sKey.substring(sKey.length() - 4));
//            String mySignature = signHmacSHA256(rawSignature, sKey);
//
//            log.info("==> [STEP 4] So sánh chữ ký:");
//            log.info("    - MoMo gửi: {}", mSignature);
//            log.info("    - Ta tính : {}", mySignature);
//
//            // 4. So sánh không phân biệt hoa thường
//            if (mySignature.equalsIgnoreCase(mSignature)) {
//                log.info("==> [SUCCESS] Chữ ký hợp lệ! Đang cập nhật trạng thái...");
//
//                if ("0".equals(params.get("resultCode"))) {
//                    String rawOrderId = params.get("orderId");
//                    UUID appointmentId = UUID.fromString(rawOrderId.split("_")[0]);
//
//                    Appointment appointment = appointmentRepository.findByIdWithLock(appointmentId)
//                            .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
//
//                    if (!appointment.isPaid()) {
//                        updateAppointmentStatus(appointment, params);
//                    }
//                }
//            } else {
//                if (message.endsWith(".")) {
//                    String altMessage = message.substring(0, message.length() - 1);
//                    String altRaw = rawSignature.replace("message=" + message, "message=" + altMessage);
//                    String altSign = signHmacSHA256(altRaw, sKey);
//                    log.info("==> [DEBUG] Thử băm không dấu chấm: {}", altSign);
//                    if (altSign.equalsIgnoreCase(mSignature)) {
//                        log.info("==> [FOUND IT] Lỗi do dấu chấm ở message!");
//                    }
//                }
//                log.error("==> [SECURITY ALERT] Chữ ký MoMo vẫn không khớp! Kiểm tra lại Secret Key hoặc encoding.");
//            }
//        } catch (Exception e) {
//            log.error("==> [ERROR] Lỗi xử lý IPN: {}", e.getMessage());
//        }
//    }


//    private void handleSuccessfulPayment(Map<String, String> params) {
//        if ("0".equals(params.get("resultCode"))) {
//            UUID appointmentId = UUID.fromString(params.get("orderId").split("_")[0]);
//            appointmentRepository.findByIdWithLock(appointmentId).ifPresent(appointment -> {
//                if (!appointment.isPaid()) {
//                    updateAppointmentStatus(appointment, params);
//                }
//            });
//        }
//    }