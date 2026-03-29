package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.DoctorProfileRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.DoctorMapper;
import com.hoanglong.healthcare_connect_backend.application.service.CloudinaryService;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IDepartmentRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.ISpecialtyRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegisterDoctorProfileUseCase {
    private final IDoctorRepository doctorRepository;
    private final IUserRepository userRepository;
    private final ISpecialtyRepository specialtyRepository;
    private final IDepartmentRepository departmentRepository;
    private final DoctorMapper doctorMapper;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public DoctorResponse execute(UUID userId, DoctorProfileRequest request) {
        // 1. Upload CV
        String cvUrl = cloudinaryService.uploadFile(request.getCvFile());

        // 2. Tìm hoặc tạo mới Profile
        Doctor doctor = doctorRepository.findByUserId(userId).orElse(new Doctor());

        // 3. Map dữ liệu
        doctor.setUser(userRepository.findById(userId).orElseThrow());
        doctor.setDepartment(departmentRepository.findById(request.getDepartmentId()).orElseThrow());
        doctor.setSpecialty(specialtyRepository.findById(request.getSpecialtyId()).orElseThrow());

        doctor.setDegree(request.getDegree());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setBiography(request.getBiography());
        doctor.setCvUrl(cvUrl);
        doctor.setStatus(DoctorStatus.PENDING);

        if (doctor.getDoctorCode() == null) {
            doctor.setDoctorCode(generateDoctorCode());
        }

        // 4. Lưu và Map sang Response
        return doctorMapper.toDoctorResponse(doctorRepository.save(doctor));
    }

    private String generateDoctorCode() {
        return "DOC-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }
}