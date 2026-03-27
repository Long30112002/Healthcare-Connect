package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.LoginResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.UserRegistrationRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.UserResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring") // Để Spring quản lý Mapper này như một Bean
public interface UserMapper extends BaseMapper<User, UserResponse> {
    // Map từ User sang LoginResponse, đồng thời nhận thêm 2 chuỗi Token từ bên ngoài
    @Mapping(target = "accessToken", source = "token")
    @Mapping(target = "refreshToken", source = "reToken") // Thêm dòng này để map Refresh Token
    @Mapping(target = "authenticated", constant = "true")
    LoginResponse toLoginResponse(User user, String token, String reToken);

    // Tự động map các trường cùng tên giữa User và UserResponse
    UserResponse toUserResponse(User user);

    // Map dữ liệu từ Request vào Entity khi Đăng ký
    User toUser(UserRegistrationRequest request);
}