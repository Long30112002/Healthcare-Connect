package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApproveDoctorUseCase {
    private final IDoctorRepository doctorRepository;
    private final IUserRepository userRepository;
    private final MailService emailService;

    @Transactional
    public void execute(UUID doctorId) {
        // 1. Tìm hồ sơ bác sĩ
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        // 2. Chỉ duyệt hồ sơ PENDING
        if (doctor.getStatus() != DoctorStatus.PENDING) {
            throw new AppException(ErrorCode.DATA_CONSTRAINT_VIOLATION);
        }

        // 3. Cập nhật trạng thái Doctor
        doctor.setStatus(DoctorStatus.APPROVED);
        doctorRepository.save(doctor);

        // 4. Nâng cấp Role cho User
        User user = doctor.getUser();
        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        user.setRole(UserRole.DOCTOR);
        userRepository.save(user);

        // 5. Chuẩn bị dữ liệu gửi Mail chúc mừng
        Map<String, Object> templateModel = new HashMap<>();
        templateModel.put("doctorName", user.getFullName());
        // Bạn có thể thêm link dẫn tới trang quản lý lịch khám chẳng hạn
        templateModel.put("dashboardLink", "https://healthcareconnect.com/doctor/dashboard");

        // 6. Gọi hàm sendEmail
        emailService.sendEmail(
                user.getEmail(),
                "Chúc mừng! Hồ sơ bác sĩ của bạn đã được phê duyệt",
                "doctor-approval-template", // Tên file HTML trong folder templates
                templateModel
        );
    }
}