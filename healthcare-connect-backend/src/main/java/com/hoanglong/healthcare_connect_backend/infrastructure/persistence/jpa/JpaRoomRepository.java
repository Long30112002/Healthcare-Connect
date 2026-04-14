package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaRoomRepository extends JpaRepository<Room, UUID> {

    // Chỉ lấy phòng chưa bị xóa
    @Query("SELECT r FROM Room r WHERE r.deleted = false")
    List<Room> findAllActive();

    @Query("SELECT r FROM Room r WHERE r.deleted = false AND r.status = :status")
    List<Room> findAllActiveByStatus(@Param("status") String status);

    @Query("SELECT r FROM Room r WHERE r.deleted = false AND r.id = :id")
    Optional<Room> findActiveById(@Param("id") UUID id);

    @Query("SELECT r FROM Room r WHERE r.deleted = false AND r.roomNumber = :roomNumber")
    Optional<Room> findActiveByRoomNumber(@Param("roomNumber") String roomNumber);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Room r WHERE r.deleted = false AND r.roomNumber = :roomNumber")
    boolean existsActiveByRoomNumber(@Param("roomNumber") String roomNumber);

    // 👇 THÊM METHOD NÀY - Lấy cả phòng đã xóa
    @Query("SELECT r FROM Room r WHERE r.id = :id")
    Optional<Room> findByIdIncludingDeleted(@Param("id") UUID id);

    // Lấy tất cả phòng (bao gồm cả đã xóa)
    @Query("SELECT r FROM Room r")
    List<Room> findAllIncludingDeleted();

    // Phương thức cũ - giữ để dùng khi cần
    Optional<Room> findByRoomNumber(String roomNumber);
}