//package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;
//
//import com.hoanglong.healthcare_connect_backend.core.entity.Room;
//import com.hoanglong.healthcare_connect_backend.core.repository.IRoomRepository;
//import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaRoomRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Component;
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//@Component
//@RequiredArgsConstructor
//public class RoomRepositoryImpl implements IRoomRepository {
//    private final JpaRoomRepository jpaRoomRepository;
//
//    @Override
//    public Room save(Room room) {
//        return jpaRoomRepository.save(room);
//    }
//
//    @Override
//    public Optional<Room> findById(UUID id) {
//        return jpaRoomRepository.findActiveById(id);
//    }
//
//    @Override
//    public Optional<Room> findByRoomNumber(String roomNumber) {
//        return jpaRoomRepository.findActiveByRoomNumber(roomNumber);
//    }
//
//    @Override
//    public List<Room> findAll() {
//        return jpaRoomRepository.findAllActive();
//    }
//
//    @Override
//    public List<Room> findAllByStatus(String status) {
//        return jpaRoomRepository.findAllActiveByStatus(status);
//    }
//
//    @Override
//    public void deleteById(UUID id) {
//        // Soft delete - chỉ đánh dấu deleted = true
//        jpaRoomRepository.findActiveById(id).ifPresent(room -> {
//            room.setDeleted(true);
//            jpaRoomRepository.save(room);
//        });
//    }
//
//    @Override
//    public boolean existsByRoomNumber(String roomNumber) {
//        return jpaRoomRepository.existsActiveByRoomNumber(roomNumber);
//    }
//
//    @Override
//    public Optional<Room> findByIdIncludingDeleted(UUID id) {
//        return jpaRoomRepository.findByIdIncludingDeleted(id);
//    }
//
//    public List<Room> findAllIncludingDeleted() {
//        return jpaRoomRepository.findAll();
//    }
//}