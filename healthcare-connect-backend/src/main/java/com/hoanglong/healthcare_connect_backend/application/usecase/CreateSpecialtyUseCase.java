package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.SpecialtyRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.SpecialtyResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.SpecialtyMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IDepartmentRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.ISpecialtyRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CreateSpecialtyUseCase {
    ISpecialtyRepository specialtyRepository;
    IDepartmentRepository departmentRepository;
    SpecialtyMapper specialtyMapper;

    public SpecialtyResponse execute(SpecialtyRequest request) {
        // 1. Kiểm tra Khoa có tồn tại không
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        // 2. The Golden Check (Logic Category của bạn)
        if (!department.getCategory().equals(request.getCategory())) {
            throw new AppException(ErrorCode.SPECIALTY_CATEGORY_MISMATCH);
        }

        // 3. Map Request -> Entity
        Specialty specialty = specialtyMapper.toEntity(request);

        // 4. Gán Department và các thông tin cần thiết
        specialty.setDepartment(department);
        specialty.setCode("SPEC-" + System.currentTimeMillis()); // Ví dụ tạo code tự động

        // 5. Lưu vào DB
        specialty = specialtyRepository.save(specialty);

        // 6. Trả về Response (Lúc này specialty đã có department bên trong)
        return specialtyMapper.toResponse(specialty);
    }
}