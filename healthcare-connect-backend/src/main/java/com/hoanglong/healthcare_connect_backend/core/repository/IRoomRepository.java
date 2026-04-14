package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.Room;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IRoomRepository {
    Room save(Room room);
    Optional<Room> findById(UUID id);
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findAll();
    List<Room> findAllByStatus(String status);
    void deleteById(UUID id);
    boolean existsByRoomNumber(String roomNumber);

    Optional<Room> findByIdIncludingDeleted(UUID id);
}