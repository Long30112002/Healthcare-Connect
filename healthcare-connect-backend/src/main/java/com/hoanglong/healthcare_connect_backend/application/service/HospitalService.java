package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.HospitalRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.HospitalResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.HospitalMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IHospitalRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalService {
    private final IHospitalRepository hospitalRepository;
    private final IUserRepository userRepository;
    private final HospitalMapper hospitalMapper;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public HospitalResponse createHospital(HospitalRequest request) {
        // 1. Tìm user theo email
        Optional<User> existingUser = userRepository.findByEmail(request.getManagerEmail());
        User manager;
        boolean isNewUserOrNotEnabled = false;

        if (existingUser.isEmpty()) {
            // TRƯỜNG HỢP 1: User hoàn toàn mới
            manager = User.builder()
                    .email(request.getManagerEmail())
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Pass ngẫu nhiên
                    .role(UserRole.HOSPITAL_MANAGER)
                    .fullName("Manager of " + request.getName())
                    .enabled(false)
                    .verificationCode(UUID.randomUUID().toString())
                    .verificationExpiry(LocalDateTime.now().plusHours(24))
                    .build();
            isNewUserOrNotEnabled = true;
        } else {
            // TRƯỜNG HỢP 2: User đã tồn tại
            manager = existingUser.get();
            manager.setRole(UserRole.HOSPITAL_MANAGER); // Nâng cấp lên Manager

            if (!Boolean.TRUE.equals(manager.getEnabled())) {
                // User cũ nhưng chưa verify -> Reset code để họ Setup Pass
                manager.setVerificationCode(UUID.randomUUID().toString());
                manager.setVerificationExpiry(LocalDateTime.now().plusHours(24));
                isNewUserOrNotEnabled = true;
            } else {
                // User đã verify (đã là PATIENT hoạt động) -> Không cần reset code
                isNewUserOrNotEnabled = false;
            }
        }

        // Lưu User trước
        userRepository.save(manager);

        // --- LOGIC GỬI MAIL DUY NHẤT Ở ĐÂY ---
        if (isNewUserOrNotEnabled) {
            // Gửi mail yêu cầu thiết lập mật khẩu (cho người mới hoặc chưa verify)
            mailService.sendSecurityEmail(manager, "SETUP_MANAGER");
        } else {
            // Gửi mail thông báo nâng cấp Role thành công (cho người đã verify rồi)
            mailService.sendSecurityEmail(manager, "UPGRADE_TO_MANAGER");
        }

        // 2. Tạo Hospital
        Hospital hospital = hospitalMapper.swallowRequestToHospital(request);
        hospital.setManager(manager);
        return hospitalMapper.toHospitalResponse(hospitalRepository.save(hospital));
    }

    public HospitalResponse getHospitalById(UUID id) {
        return hospitalRepository.findById(id)
                .map(hospitalMapper::toHospitalResponse)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN') or (hasRole('HOSPITAL_MANAGER') and @securityService.isManagerOfHospital(#id))")
    public HospitalResponse updateHospital(UUID id, HospitalRequest request) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));

        // MapStruct update
        hospitalMapper.updateHospital(hospital, request);

        return hospitalMapper.toHospitalResponse(hospitalRepository.save(hospital));
    }
}