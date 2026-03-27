package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@RequiredArgsConstructor
public abstract class BaseService<E, R, ID> {
//    E (Entity): Đại diện cho bất kỳ Entity nào (User, Specialty, Appointment...).
//    R (Response): Đại diện cho DTO trả về tương ứng.

    protected abstract JpaRepository<E, ID> getRepository();
    protected abstract BaseMapper<E, R> getMapper();

    private final ErrorCode notFoundCode;
    private final ErrorCode alreadyExistsCode;

    // 1. Hàm lấy dữ liệu (Lỗi Not Found)
    public R getById(ID id) {
        return getRepository().findById(id)
                .map(getMapper()::toResponse)
                .orElseThrow(() -> new AppException(notFoundCode));
    }

    // 2. Hàm kiểm tra trùng lặp trước khi tạo (Lỗi Already Exists)
    protected void checkExistBeforeCreate(ID id) {
        if (getRepository().existsById(id)) {
            throw new AppException(alreadyExistsCode);
        }
    }

    // 3. Hàm xóa (Lỗi Not Found hoặc Constraint)
    public void delete(ID id) {
        if (!getRepository().existsById(id)) {
            throw new AppException(notFoundCode);
        }
        try {
            getRepository().deleteById(id);
        } catch (Exception e) {
            // Ví dụ: Xóa một Khoa đang có Bác sĩ làm việc sẽ bị lỗi này
            throw new AppException(ErrorCode.DATA_CONSTRAINT_VIOLATION);
        }
    }

    public List<R> getAll() {
        return getRepository().findAll().stream()
                .map(getMapper()::toResponse)
                .toList();
    }
}
