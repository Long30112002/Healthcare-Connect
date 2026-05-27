package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorProfileRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.DoctorMapper;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorAuditLogService;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorApplicationStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.UserRole;
import com.hoanglong.healthcare_connect_backend.core.entity.*;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.*;
import com.hoanglong.healthcare_connect_backend.infrastructure.storage.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegisterDoctorProfileUseCase {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final DoctorAuditLogService doctorAuditLogService;
    private final SpecialtyRepository specialtyRepository;
    private final DepartmentRepository departmentRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorMapper doctorMapper;
    private final FileStorageService fileStorageService;

    @Transactional
    public DoctorResponse execute(UUID userId, DoctorProfileRequest request, HttpServletRequest httpRequest) {

        // 1. Validate CV
        validateCv(request);

        // 2. Validate user role (chỉ PATIENT mới được đăng ký làm bác sĩ)
        User user = getUser(userId);
        validateUserRole(user);

        // 3. Check existing doctor profile
        Optional<Doctor> existingDoctorOpt = doctorRepository.findByUserId(userId);

        if (existingDoctorOpt.isPresent()) {
            Doctor existingDoctor = existingDoctorOpt.get();
            return handleExistingDoctor(existingDoctor, userId, request, httpRequest);
        }

        // 4. Validate and fetch entities
        Department department = getDepartment(request.getDepartmentId());
        Specialty specialty = getSpecialty(request.getSpecialtyId());
        validateDepartmentAndSpecialty(department, specialty);
        Hospital hospital = getHospital(request.getHospitalId());

        // 5. Upload CV (after all validations passed)
        String cvUrl = fileStorageService.uploadFile(request.getCvFile());

        // 6. Create new doctor
        Doctor doctor = createNewDoctor(user, department, specialty, hospital, request, cvUrl);
        Doctor savedDoctor = doctorRepository.save(doctor);

        // 7. Record history
        doctorAuditLogService.recordDoctorHistory(
                savedDoctor.getId(),
                userId,
                "DOCTOR",
                DoctorApplicationStatus.CREATE,
                null,
                DoctorStatus.PENDING.name(),
                "Nộp hồ sơ đăng ký bác sĩ lần đầu",
                httpRequest
        );

        return doctorMapper.toDoctorResponse(savedDoctor);
    }

    private void validateUserRole(User user) {
        // Kiểm tra user đã xác thực email chưa
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new AppException(ErrorCode.USER_NOT_VERIFIED);
        }

        // KIỂM TRA USER ĐÃ CÓ ROLE ĐẶC BIỆT CHƯA
        if (user.getRole() == UserRole.ADMIN) {
            throw new AppException(ErrorCode.ADMIN_CANNOT_BE_DOCTOR);
        }

        if (user.getRole() == UserRole.DOCTOR) {
            throw new AppException(ErrorCode.ALREADY_DOCTOR);
        }

        if (user.getRole() == UserRole.HOSPITAL_MANAGER) {
            throw new AppException(ErrorCode.MANAGER_CANNOT_BE_DOCTOR);
        }

        if (user.getRole() == UserRole.RECEPTIONIST) {
            throw new AppException(ErrorCode.RECEPTIONIST_CANNOT_BE_DOCTOR);
        }
    }

    private DoctorResponse handleExistingDoctor(Doctor doctor, UUID userId,
            DoctorProfileRequest request,
            HttpServletRequest httpRequest) {

        // Không cho apply lại nếu đã approved
        if (doctor.getStatus() == DoctorStatus.APPROVED) {
            throw new AppException(ErrorCode.DOCTOR_ALREADY_APPROVED);
        }

        // Không cho apply nếu đang pending hoặc verified
        if (doctor.getStatus() == DoctorStatus.PENDING ||
                doctor.getStatus() == DoctorStatus.VERIFIED) {
            throw new AppException(ErrorCode.DOCTOR_PROFILE_PENDING_OR_VERIFIED);
        }

        // Chỉ cho apply lại khi REJECTED
        if (doctor.getStatus() == DoctorStatus.REJECTED) {
            return updateExistingDoctor(doctor, userId, request, httpRequest);
        }

        throw new AppException(ErrorCode.INVALID_DOCTOR_STATUS);
    }

    private DoctorResponse updateExistingDoctor(Doctor oldDoc,
            UUID userId,
            DoctorProfileRequest request,
            HttpServletRequest httpRequest) {

        Department department = getDepartment(request.getDepartmentId());
        Specialty specialty = getSpecialty(request.getSpecialtyId());
        validateDepartmentAndSpecialty(department, specialty);
        Hospital hospital = getHospital(request.getHospitalId());

        // Upload CV sau validate
        String cvUrl = fileStorageService.uploadFile(request.getCvFile());

        oldDoc.setDepartment(department);
        oldDoc.setSpecialty(specialty);
        oldDoc.setHospital(hospital);
        oldDoc.setDegree(request.getDegree());
        oldDoc.setExperienceYears(request.getExperienceYears());
        oldDoc.setBiography(request.getBiography());
        oldDoc.setCvUrl(cvUrl);
        oldDoc.setStatus(DoctorStatus.PENDING);
        oldDoc.setRejectionReason(null);
        oldDoc.setRejectionNote(null);

        Doctor savedDoctor = doctorRepository.save(oldDoc);

        doctorAuditLogService.recordDoctorHistory(
                savedDoctor.getId(),
                userId,
                "DOCTOR",
                DoctorApplicationStatus.REAPPLY,
                DoctorStatus.REJECTED.name(),
                DoctorStatus.PENDING.name(),
                "Gửi lại hồ sơ sau khi bị từ chối",
                httpRequest
        );

        return doctorMapper.toDoctorResponse(savedDoctor);
    }

    private Doctor createNewDoctor(User user,
            Department department,
            Specialty specialty,
            Hospital hospital,
            DoctorProfileRequest request,
            String cvUrl) {

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setDepartment(department);
        doctor.setSpecialty(specialty);
        doctor.setHospital(hospital);
        doctor.setDegree(request.getDegree());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setBiography(request.getBiography());
        doctor.setCvUrl(cvUrl);
        doctor.setStatus(DoctorStatus.PENDING);
        doctor.setDoctorCode(generateDoctorCode());

        return doctor;
    }

    private void validateCv(DoctorProfileRequest request) {
        if (request.getCvFile() == null || request.getCvFile().isEmpty()) {
            throw new AppException(ErrorCode.REQUIRED_CV);
        }
    }

    private void validateDepartmentAndSpecialty(Department department, Specialty specialty) {
        if (!specialty.getDepartment().getId().equals(department.getId())) {
            throw new AppException(ErrorCode.SPECIALTY_NOT_BELONG_TO_DEPARTMENT);
        }

        if (!department.getCategory().equals(specialty.getCategory())) {
            throw new AppException(ErrorCode.SPECIALTY_CATEGORY_MISMATCH);
        }
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private Department getDepartment(UUID id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));
    }

    private Specialty getSpecialty(UUID id) {
        return specialtyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_FOUND));
    }

    private Hospital getHospital(UUID id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));
    }

    private String generateDoctorCode() {
        return "DOC-" + LocalDate.now().getYear() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}