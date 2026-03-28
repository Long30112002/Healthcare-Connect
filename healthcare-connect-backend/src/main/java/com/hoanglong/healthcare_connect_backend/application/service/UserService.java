package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.UserRegistrationRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.application.mapper.UserMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaUserRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService extends BaseService<User, UserRegistrationRequest, UserResponse, UUID>
{

    private final IUserRepository userRepository;
    private final UserMapper userMapper;
    private final JpaUserRepository jpaUserRepository;

    public UserService(IUserRepository userRepository, UserMapper userMapper, JpaUserRepository jpaUserRepository) {
        super(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_EXISTED);
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.jpaUserRepository = jpaUserRepository;
    }

    // Bắt buộc Override các "đầu nối" cho BaseService
    @Override protected JpaRepository<User, UUID> getRepository() { return jpaUserRepository; }
    @Override protected BaseMapper<User, UserResponse> getMapper() { return userMapper; }

    @Override
    protected User mapToEntity(UserRegistrationRequest request) {
        // Nếu đã có RegisterUserUseCase thì có thể để trống hoặc
        // dùng Mapper để chuyển đổi ở đây
        return userMapper.toEntity(request);
    }

    // Các hàm CRUD như getById, getAll, delete... giờ ĐÃ CÓ SẴN, không cần viết gì thêm!
    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String userId = context.getAuthentication().getName(); // Bây giờ getName() trả về UUID string

        return userRepository.findById(UUID.fromString(userId)) // Dùng findById thay vì findByEmail
                .map(userMapper::toUserResponse)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}
