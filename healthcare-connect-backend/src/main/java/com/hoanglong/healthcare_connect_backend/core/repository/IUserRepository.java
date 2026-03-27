package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.User;

import java.time.LocalDateTime;
import java.util.Optional;

public interface IUserRepository {
//    Optional<User> findByEmail(String email);
//    Optional<User> findByVerificationCode(String code);
//    int verifyUser(String code);
//    void deleteUnverifiedUsers(LocalDateTime threshold);
    User save(User user);
}
