package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.SpecialtyRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.SpecialtyResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.SpecialtyMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DepartmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.SpecialtyRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CreateSpecialtyUseCase {
    private final SpecialtyRepository specialtyRepository;
    private final DepartmentRepository departmentRepository;
    private final SpecialtyMapper specialtyMapper;

    public SpecialtyResponse execute(SpecialtyRequest request) {
        // 1. Kiểm tra Khoa có tồn tại không
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        // 2. Kiểm tra Category có khớp không
        if (!department.getCategory().equals(request.getCategory())) {
            throw new AppException(ErrorCode.SPECIALTY_CATEGORY_MISMATCH);
        }

        // 3. Kiểm tra tên chuyên khoa đã tồn tại chưa
        if (specialtyRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.SPECIALTY_EXISTED);
        }

        // 4. Map Request -> Entity
        Specialty specialty = specialtyMapper.toEntity(request);
        specialty.setDepartment(department);
        specialty.setCode(generateSpecialtyCode(department.getCode()));

        // 5. Lưu vào DB
        specialty = specialtyRepository.save(specialty);

        // 6. Trả về Response (Lúc này specialty đã có department bên trong)
        return specialtyMapper.toResponse(specialty);
    }

    private String generateSpecialtyCode(String departmentCode) {
        String randomPart = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return departmentCode + "_" + randomPart;
    }
}