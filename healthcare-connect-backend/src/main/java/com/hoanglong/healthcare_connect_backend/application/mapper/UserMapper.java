package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.LoginResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.UserRegistrationRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.UserResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper extends BaseMapper<User, UserResponse> {

    @Mapping(target = "accessToken", source = "token")
    @Mapping(target = "refreshToken", source = "reToken")
    @Mapping(target = "authenticated", constant = "true")
    LoginResponse toLoginResponse(User user, String token, String reToken);

    UserResponse toUserResponse(User user);

    User toUser(UserRegistrationRequest request);
}