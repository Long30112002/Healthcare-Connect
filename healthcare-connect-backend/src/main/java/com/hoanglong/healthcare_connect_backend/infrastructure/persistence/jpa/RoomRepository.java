package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.RoomStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
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

    @Query("SELECT r FROM Room r WHERE r.id = :id")
    Optional<Room> findByIdIncludingDeleted(@Param("id") UUID id);

    @Query("SELECT r FROM Room r")
    List<Room> findAllIncludingDeleted();

    Optional<Room> findByRoomNumber(String roomNumber);

    // Kiểm tra số phòng đã tồn tại (kể cả đã xóa mềm)
    boolean existsByRoomNumber(String roomNumber);

    // Lấy tất cả phòng (không filter deleted) - dùng cho admin
    List<Room> findAll();

    // Lấy phòng theo status (không filter deleted)
    List<Room> findAllByStatus(RoomStatus status);

    // Lấy phòng theo status và chưa xóa
    List<Room> findByStatusAndDeletedFalse(RoomStatus status);

    // Lấy phòng đang rảnh (AVAILABLE và chưa xóa)
    @Query("SELECT r FROM Room r WHERE r.status = 'AVAILABLE' AND r.deleted = false")
    List<Room> findAvailableRooms();

    // Lấy phòng theo building
    List<Room> findByBuildingAndDeletedFalse(String building);

    // Đếm số phòng theo status
    long countByStatusAndDeletedFalse(RoomStatus status);

    // Kiểm tra phòng có đang được sử dụng không
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Room r " +
            "WHERE r.id = :id AND r.status = 'OCCUPIED' AND r.deleted = false")
    boolean isRoomOccupied(@Param("id") UUID id);

    // Lấy phòng đang bảo trì
    @Query("SELECT r FROM Room r WHERE r.status = 'MAINTENANCE' AND r.deleted = false")
    List<Room> findMaintenanceRooms();
}