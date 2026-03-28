package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.RejectDoctorRequest;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.RejectionReason;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RejectDoctorUseCase {
    private final IDoctorRepository doctorRepository;
    private final MailService emailService; // Sẽ tạo ở bước sau

    @Transactional
    public void execute(UUID doctorId, RejectDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        // 1. Cập nhật DB
        doctor.setStatus(DoctorStatus.REJECTED);
        doctor.setRejectionReason(request.getReasonCode());
        doctor.setRejectionNote(request.getNote());
        doctorRepository.save(doctor);

        // 2. Chuẩn bị dữ liệu để đổ vào Template HTML
        Map<String, Object> templateModel = new HashMap<>();
        templateModel.put("doctorName", doctor.getUser().getFullName());

        String reasonDetail = (request.getReasonCode() == RejectionReason.OTHER)
                ? request.getNote()
                : request.getReasonCode().getMessage();
        templateModel.put("reason", reasonDetail);

        // 3. Gọi hàm sendEmail (Khớp 4 tham số của Long)
        emailService.sendEmail(
                doctor.getUser().getEmail(),
                "Thông báo kết quả hồ sơ Bác sĩ",
                "doctor-rejection-template", // <--- Tên file .html trong folder templates
                templateModel
        );
    }
}
