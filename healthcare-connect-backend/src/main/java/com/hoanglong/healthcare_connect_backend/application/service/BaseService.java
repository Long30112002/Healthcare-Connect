package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public abstract class BaseService<E, R, ID> {
    protected abstract JpaRepository<E, ID> getRepository();
    protected abstract BaseMapper<E, R> getMapper();

    // Định nghĩa các "đầu lỗi" cho từng Service con
    protected abstract ErrorCode getNotFoundErrorCode();
    protected abstract ErrorCode getAlreadyExistsErrorCode();

    // 1. Hàm lấy dữ liệu (Lỗi Not Found)
    public R getById(ID id) {
        return getRepository().findById(id)
                .map(getMapper()::toResponse)
                .orElseThrow(() -> new AppException(getNotFoundErrorCode()));
    }

    // 2. Hàm kiểm tra trùng lặp trước khi tạo (Lỗi Already Exists)
    protected void checkExistBeforeCreate(ID id) {
        if (getRepository().existsById(id)) {
            throw new AppException(getAlreadyExistsErrorCode());
        }
    }

    // 3. Hàm xóa (Lỗi Not Found hoặc Constraint)
    public void delete(ID id) {
        if (!getRepository().existsById(id)) {
            throw new AppException(getNotFoundErrorCode());
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
