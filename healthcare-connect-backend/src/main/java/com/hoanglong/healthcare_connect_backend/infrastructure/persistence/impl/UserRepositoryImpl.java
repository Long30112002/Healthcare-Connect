package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;

import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserRepositoryImpl implements IUserRepository {
    private final JpaUserRepository jpaUserRepository;

    @Override
    public User save(User user) {
        return jpaUserRepository.save(user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaUserRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findByVerificationCode(String code) {
        return jpaUserRepository.findByVerificationCode(code);
    }

    @Override
    public int verifyUserByCode(String code) {
        // Gọi đúng cái hàm verifyUserByCode bạn đã viết trong JpaUserRepository
        return jpaUserRepository.verifyUserByCode(code);
    }

    @Override
    public void deleteUnverifiedUsers(LocalDateTime threshold) {
        jpaUserRepository.deleteByEnabledFalseAndCreatedAtBefore(threshold);
    }

    @Override
    public Optional<User> findById(UUID userId) {
        return jpaUserRepository.findById(userId);
    }

    @Override
    public List<User> findAll() {
        return jpaUserRepository.findAll();
    }
}
