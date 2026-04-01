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
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOSPITAL_MANAGER')")
    public void execute(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        // Lấy thông tin người dùng hiện tại từ SecurityContext
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isManager = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HOSPITAL_MANAGER"));

        // LUỒNG 1: ADMIN DUYỆT (Bước 1: Verify giấy tờ)
        if (isAdmin && doctor.getStatus() == DoctorStatus.PENDING) {
            doctor.setStatus(DoctorStatus.VERIFIED);
        }

        // LUỒNG 2: MANAGER DUYỆT (Bước 2: Approve vào làm - Chốt Role)
        else if (isManager && doctor.getStatus() == DoctorStatus.VERIFIED) {
            UUID currentManagerId = SecurityUtils.getCurrentUserId();
            if (!doctor.getHospital().getManager().getId().equals(currentManagerId)) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            doctor.setStatus(DoctorStatus.APPROVED);

            // Chỉ khi Manager chốt thì mới nâng cấp Role
            User user = doctor.getUser();
            user.setRole(UserRole.DOCTOR);
            userRepository.save(user);

            // Gửi mail chúc mừng chính thức
            sendCongratsEmail(user);
        } else {
            // Nếu sai thứ tự duyệt (Manager duyệt khi chưa có Verify) thì báo lỗi
            throw new AppException(ErrorCode.INVALID_APPROVE_STEP);
        }

        doctorRepository.save(doctor);
    }

    private void sendCongratsEmail(User user) {
        Map<String, Object> templateModel = new HashMap<>();
        templateModel.put("doctorName", user.getFullName());
        templateModel.put("dashboardLink", "https://healthcareconnect.com/doctor/dashboard");

        emailService.sendEmail(
                user.getEmail(),
                "Chúc mừng! Bạn đã chính thức trở thành Bác sĩ trên hệ thống",
                "doctor-approval-template",
                templateModel
        );
    }
}