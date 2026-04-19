package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.ReceptionistListResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.ReceptionistMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceptionistService {
    private final ReceptionistRepository receptionistRepository;
    private final ReceptionistMapper receptionistMapper;

    //Admin: Lấy tất cả receptionists
    public Page<ReceptionistListResponse> getAllReceptionists(ReceptionistStatus status, String keyword, Pageable pageable) {
        Page<Receptionist> receptionistPage;

        if (keyword != null && !keyword.isEmpty()) {
            receptionistPage = receptionistRepository.search(keyword, pageable);
        } else if (status != null) {
            receptionistPage = receptionistRepository.findByStatus(status, pageable);
        } else {
            receptionistPage = receptionistRepository.findAll(pageable);
        }

        return receptionistPage.map(receptionistMapper::toListResponse);
    }

    //Manager: Lấy receptionists của bệnh viện mình quản lý
    public Page<ReceptionistListResponse> getReceptionistsByHospital(UUID hospitalId,
            ReceptionistStatus status,
            String keyword,
            Pageable pageable) {
        Page<Receptionist> receptionistPage;

        if (keyword != null && !keyword.isEmpty()) {
            receptionistPage = receptionistRepository.searchByHospital(hospitalId, keyword, pageable);
        } else if (status != null) {
            receptionistPage = receptionistRepository.findByHospitalIdAndStatus(hospitalId, status, pageable);
        } else {
            receptionistPage = receptionistRepository.findByHospitalId(hospitalId, pageable);
        }

        return receptionistPage.map(receptionistMapper::toListResponse);
    }

    //Manager: Lấy hospitalId từ token
    public UUID getCurrentManagerHospitalId() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        // Lấy hospital từ manager (cần implement)
        // Tạm thời return null, sau này sẽ lấy từ Manager entity
        return null;
    }
}