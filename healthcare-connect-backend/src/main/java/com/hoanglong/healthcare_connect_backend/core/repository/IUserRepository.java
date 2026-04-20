//package com.hoanglong.healthcare_connect_backend.core.repository;
//
//import com.hoanglong.healthcare_connect_backend.core.entity.User;
//
//import java.time.LocalDateTime;
//import java.util.Collection;
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//public interface IUserRepository {
//    User save(User user);
//    Optional<User> findByEmail(String email);
//    Optional<User> findByVerificationCode(String code);
//    int verifyUserByCode(String code);
//    void deleteUnverifiedUsers(LocalDateTime threshold);
//
//    Optional<User> findById(UUID userId);
//
//    List<User> findAll();
//}
