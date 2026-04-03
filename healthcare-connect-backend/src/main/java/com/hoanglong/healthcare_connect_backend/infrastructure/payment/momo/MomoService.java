package com.hoanglong.healthcare_connect_backend.infrastructure.payment.momo;

import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.application.service.NotificationService;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.PaymentStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Payment;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.payment.PaymentProvider;
import com.hoanglong.healthcare_connect_backend.core.repository.IAppointmentRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IPaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.cloudinary.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomoService implements PaymentProvider
{
    private final MomoConfig momoConfig;
    private final IAppointmentRepository appointmentRepository;
    private final IPaymentRepository paymentRepository;
    private final MailService mailService;
    private final NotificationService notificationService;
    private static final String REQUEST_TYPE = "payWithMethod";

    public String createPaymentRequest(Appointment appointment) {
        try {
            // Lấy dữ liệu từ object momoConfig
            String partnerCode = momoConfig.getPartnerCode();
            String accessKey = momoConfig.getAccessKey();
            String secretKey = momoConfig.getSecretKey();
            String endpoint = momoConfig.getEndpoint();
            String returnUrl = momoConfig.getReturnUrl();
            String notifyUrl = momoConfig.getNotifyUrl();

            // XỬ LÝ AMOUNT: Ép double về long
            String amount = String.valueOf((long) appointment.getSchedule().getPrice());

            // Tạo requestId và orderId
            String requestId = partnerCode + System.currentTimeMillis();
            String orderId = appointment.getId().toString() + "_" + System.currentTimeMillis();
            String orderInfo = "Thanh Toan Lich Kham " + orderId.substring(0, 8);
            String extraData = "";

            // 1. TẠO CHUỖI BĂM (RAW SIGNATURE)
            String rawSignature = String.format(
                    "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                    accessKey, amount, extraData, notifyUrl, orderId, orderInfo, partnerCode, returnUrl,
                    requestId, REQUEST_TYPE);

            System.out.println("--- DEBUG RAW SIGNATURE ---");
            System.out.println(rawSignature);

            // 2. KÝ CHỮ KÝ
            String signature = signHmacSHA256(rawSignature, secretKey);

            // 3. TẠO JSON BODY
            JSONObject requestBody = new JSONObject();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("requestId", requestId);
            requestBody.put("amount", Long.parseLong(amount));
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
                        log.info("==> [MOMO] Tạo link thành công: {}", responseJson.getString("payUrl"));
                        return responseJson.getString("payUrl");
                    } else {
                        // Nếu MoMo trả về lỗi (như sai Key, sai Signature...)
                        log.error("==> [MOMO ERROR] Phản hồi lỗi: {}", result);
                        throw new AppException(ErrorCode.PAYMENT_ERROR);
                    }
                }            }
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"Lỗi: " + e.getMessage() + "\"}";
        }
    }

    private String signHmacSHA256(String data, String key) throws Exception {
        Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSHA256.init(secretKeySpec);
        byte[] hash = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    @Transactional
    public void processIPN(Map<String, String> params) {
        String mSignature = params.get("signature");

        String rawSignature = String.format(
                "accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s&partnerCode=%s&requestId=%s&responseTime=%s&resultCode=%s",
                momoConfig.getAccessKey(), params.get("amount"), params.get("extraData"),
                params.get("message"), params.get("orderId"), params.get("orderInfo"),
                momoConfig.getPartnerCode(), params.get("requestId"), params.get("responseTime"),
                params.get("resultCode")
        );
        log.info("==> [DEBUG] Chuỗi Raw IPN hệ thống đang tính: {}", rawSignature);
        try {
            String mySignature = signHmacSHA256(rawSignature, momoConfig.getSecretKey());
            if (mySignature.equals(mSignature)) {
                if ("0".equals(params.get("resultCode"))) {
                    String rawOrderId = params.get("orderId");
                    UUID appointmentId = UUID.fromString(rawOrderId.split("_")[0]);

                    // Bước 1: Khóa dòng Appointment lại để xử lý độc quyền
                    Appointment appointment = appointmentRepository.findByIdWithLock(appointmentId)
                            .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

                    // Bước 2: Kiểm tra nếu đã thanh toán rồi thì thoát
                    if (appointment.isPaid()) {
                        log.info("==> [SKIP] Lịch hẹn {} đã thanh toán trước đó.", appointmentId);
                        return;
                    }

                    // Bước 3: Cập nhật trạng thái và lưu Payment
                    updateAppointmentStatus(appointment, params);
                }
            } else {
                log.error("==> [SECURITY ALERT] Chữ ký MoMo không hợp lệ!");
            }
        } catch (Exception e) {
            log.error("Lỗi xác thực IPN: {}", e.getMessage());
        }
    }

    private void updateAppointmentStatus(Appointment appointment, Map<String, String> params) {
        // 1. Cập nhật Appointment
        appointment.setPaid(true);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);

        // 2. Tạo bản ghi Payment theo Entity mới của Long
        Payment payment = Payment.builder()
                .appointment(appointment) // Giả định Entity Payment có field Appointment appointment
                .transactionNo(params.get("transId"))
                .amount(new BigDecimal(params.get("amount")))
                .paymentMethod("MOMO")
                .status(PaymentStatus.SUCCESS)
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        mailService.sendPaymentSuccessEmail(appointment);

        // 4. Bắn tín hiệu realtime để front - end tự cập nhật
        Map<String, Object> socketData = new HashMap<>();
        socketData.put("appointmentId", appointment.getId());
        socketData.put("status", "PAID");
        socketData.put("message", "Thanh toán thành công!");

        // Frontend sẽ lắng nghe tại topic: /topic/payment/{id}
        notificationService.sendRealtimeNotification(
                "/topic/payment/" + appointment.getId(),
                socketData
        );

        log.info("==> [SUCCESS] Đã cập nhật và phát tín hiệu realtime cho đơn hàng: {}", appointment.getId());
    }

}