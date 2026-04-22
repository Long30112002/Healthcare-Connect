package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import org.springframework.stereotype.Service;

@Service
public class UserRoleService {
    public void assignRole(User user, UserRole newRole) {
        boolean isBaseUser = user.getRole() == UserRole.PATIENT;
        if (isBaseUser) {
            user.setRole(newRole);
        } else {
            throw new AppException(ErrorCode.USER_ALREADY_HAS_ROLE);
        }
    }
}