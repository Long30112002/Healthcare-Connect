package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.application.mapper.UserMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService extends BaseService<User, UserResponse, String> {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    // Bắt buộc Override các "đầu nối" cho BaseService
    @Override protected JpaRepository<User, String> getRepository() { return userRepository; }
    @Override protected BaseMapper<User, UserResponse> getMapper() { return userMapper; }
    @Override protected ErrorCode getNotFoundErrorCode() { return ErrorCode.USER_NOT_FOUND; }
    @Override protected ErrorCode getAlreadyExistsErrorCode() { return ErrorCode.USER_EXISTED; }

    // Hàm getAll() giờ đã có sẵn từ BaseService, Long không cần viết lại!

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toResponse(user);
    }
}
