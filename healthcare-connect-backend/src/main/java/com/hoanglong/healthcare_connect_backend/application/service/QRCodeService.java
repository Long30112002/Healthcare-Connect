package com.hoanglong.healthcare_connect_backend.application.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

@Service
@Slf4j
public class QRCodeService {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final String tempDir = System.getProperty("java.io.tmpdir");

    // Tạo QR code và trả về đường dẫn file (dùng cho CID)
    public String generateQRCodeFile(String appointmentId) throws IOException, WriterException {
        String checkInUrl = frontendUrl + "/check-in?token=" + appointmentId;
        String fileName = "qr_" + appointmentId + ".png";
        Path filePath = Paths.get(tempDir, fileName);

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(checkInUrl, BarcodeFormat.QR_CODE, 250, 250);

        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", filePath);

        log.info("==> [QR] Đã tạo file QR tại: {}", filePath.toString());
        return filePath.toString();
    }

    // Xóa file QR tạm thời sau khi gửi email
    public void deleteQRCodeFile(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
            log.info("==> [QR] Đã xóa file tạm: {}", filePath);
        } catch (IOException e) {
            log.warn("==> [QR] Không thể xóa file tạm: {}", e.getMessage());
        }
    }

    public byte[] generateQRCodeImage(String appointmentId) {
        try {
            String url = frontendUrl + "/check-in?token=" + appointmentId;

            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(url, BarcodeFormat.QR_CODE, 300, 300);

            ByteArrayOutputStream output = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", output);

            return output.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo QR", e);
        }
    }

    // Giữ lại method cũ cho các mục đích khác
    public String generateQRCodeBase64(String appointmentId) {
        try {
            String checkInUrl = frontendUrl + "/check-in?token=" + appointmentId;

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(checkInUrl, BarcodeFormat.QR_CODE, 250, 250);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

            return "data:image/png;base64," + Base64.getEncoder().encodeToString(outputStream.toByteArray());

        } catch (WriterException | IOException e) {
            log.error("==> [QR] Lỗi tạo QR code: {}", e.getMessage());
            return null;
        }
    }
}