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
import com.hoanglong.healthcare_connect_backend.core.repository.*;
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
    private final IHospitalRepository hospitalRepository; // 1. THÊM REPOSITORY NÀY
    private final DoctorMapper doctorMapper;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public DoctorResponse execute(UUID userId, DoctorProfileRequest request) {
        // 1. Upload CV
        String cvUrl = cloudinaryService.uploadFile(request.getCvFile());

        // 2. Tìm hoặc tạo mới Profile
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Doctor doctor = doctorRepository.findByUserId(userId).orElse(new Doctor());

        // 3. Tìm các thực thể liên quan
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new RuntimeException("Specialty not found"));

        // 2. LẤY HOSPITAL TỪ DATABASE
        var hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        // 4. Map dữ liệu vào Entity
        doctor.setUser(user);
        doctor.setDepartment(department);
        doctor.setSpecialty(specialty);
        doctor.setHospital(hospital); // 3. GÁN VÀO ĐÂY THÌ MAPPER MỚI CÓ TÊN ĐỂ LẤY

        doctor.setDegree(request.getDegree());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setBiography(request.getBiography());
        doctor.setCvUrl(cvUrl);
        doctor.setStatus(DoctorStatus.PENDING);

        if (doctor.getDoctorCode() == null) {
            doctor.setDoctorCode(generateDoctorCode());
        }

        // 5. Lưu và Map sang Response
        return doctorMapper.toDoctorResponse(doctorRepository.save(doctor));
    }

    private String generateDoctorCode() {
        return "DOC-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }
}