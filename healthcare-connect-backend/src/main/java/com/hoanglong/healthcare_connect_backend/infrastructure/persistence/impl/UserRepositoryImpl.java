package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;

import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;
@Component
@RequiredArgsConstructor
public class UserRepositoryImpl implements IUserRepository
{
    private final JpaUserRepository jpaUserRepository;

    @Override
    public User save(User user) {
        return jpaUserRepository.save(user);
    }
}
