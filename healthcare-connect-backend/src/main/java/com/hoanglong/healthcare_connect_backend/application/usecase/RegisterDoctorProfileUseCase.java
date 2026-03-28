package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.DoctorProfileRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.DoctorMapper;
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
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegisterDoctorProfileUseCase {
    private final IDoctorRepository doctorRepository;
    private final IUserRepository userRepository;
    private final ISpecialtyRepository specialtyRepository;
    private final IDepartmentRepository departmentRepository;
    private final DoctorMapper doctorMapper;

    @Transactional
    public DoctorResponse execute(UUID userId, DoctorProfileRequest request) {
        // 1. Kiểm tra User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Xử lý logic nộp hồ sơ
        // findByUserId để lấy hẳn object ra check status
        Optional<Doctor> existingDoctorOpt = doctorRepository.findByUserId(userId);

        if (existingDoctorOpt.isPresent()) {
            Doctor existingDoctor = existingDoctorOpt.get();

            // Nếu đã là DOCTOR hoặc đang chờ duyệt -> Chặn lại
            if (existingDoctor.getStatus() == DoctorStatus.APPROVED) {
                throw new AppException(ErrorCode.DATA_CONSTRAINT_VIOLATION);
            }
            if (existingDoctor.getStatus() == DoctorStatus.PENDING) {
                throw new AppException(ErrorCode.DATA_CONSTRAINT_VIOLATION); // "Hồ sơ đang xử lý"
            }

            // Nếu trạng thái là REJECTED -> Cho phép nộp đè lên bản cũ
            if (existingDoctor.getStatus() == DoctorStatus.REJECTED) {
                return updateExistingProfile(existingDoctor, request);
            }
        }

        // 3. Nếu chưa từng nộp -> Tạo mới hoàn toàn (Logic cũ của Long)
        return createNewProfile(user, request);
    }

    private DoctorResponse updateExistingProfile(Doctor doctor, DoctorProfileRequest request) {
        // Cập nhật thông tin mới từ request
        doctor.setDegree(request.getDegree());
        doctor.setExperience(request.getExperience());
        doctor.setConsultationFee(request.getConsultationFee());

        // Cập nhật lại Khoa/Chuyên ngành mới (nếu họ muốn đổi)
        doctor.setDepartment(departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND)));
        doctor.setSpecialty(specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_FOUND)));

        // QUAN TRỌNG: Đưa status về PENDING để Admin thấy lại trong danh sách chờ
        doctor.setStatus(DoctorStatus.PENDING);

        // Xóa lý do từ chối cũ để hồ sơ sạch sẽ
        doctor.setRejectionReason(null);
        doctor.setRejectionNote(null);

        Doctor updatedDoctor = doctorRepository.save(doctor);
        return doctorMapper.toDoctorResponse(updatedDoctor);
    }

    private DoctorResponse createNewProfile(User user, DoctorProfileRequest request) {
        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        Specialty spec = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_FOUND));

        Doctor doctor = Doctor.builder()
                .doctorCode(generateDoctorCode())
                .user(user)
                .department(dept)
                .specialty(spec)
                .degree(request.getDegree())
                .experience(request.getExperience())
                .consultationFee(request.getConsultationFee())
                .status(DoctorStatus.PENDING)
                .build();

        return doctorMapper.toDoctorResponse(doctorRepository.save(doctor));
    }

    private String generateDoctorCode() {
        return "DOC-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }
}