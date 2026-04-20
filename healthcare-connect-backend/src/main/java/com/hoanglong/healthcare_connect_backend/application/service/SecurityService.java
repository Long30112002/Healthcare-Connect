package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service("securityService")
@RequiredArgsConstructor
@Slf4j
public class SecurityService {

    private final HospitalRepository hospitalRepository;

    public boolean isManagerOfHospital(UUID hospitalId) {
        // 1. Lấy User ID từ toke
        log.info("Đang kiểm tra quyền sở hữu cho Hospital ID: {}", hospitalId); // Thêm dòng này
        try {
            UUID currentUserId = SecurityUtils.getCurrentUserId();
            log.info("User đang gọi API: {}", currentUserId);

            // 2. Tìm bệnh viện theo ID
            return hospitalRepository.findById(hospitalId)
                    .map(hospital -> {
                        // 3. So khớp ID: ID từ Token phải trùng với ID của Manager trong DB
                        return hospital.getManager() != null &&
                                hospital.getManager().getId().equals(currentUserId);
                    })
                    .orElse(false);
        } catch (Exception e) {
            return false;
        }
    }
}