package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.room.RoomRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.room.RoomResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.RoomMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.RoomStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Room;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {
    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;

    public List<RoomResponse> getAllRooms() {
        return roomMapper.toResponseList(roomRepository.findAll());
    }

    // Sửa method getAvailableRooms
    public List<RoomResponse> getAvailableRooms() {
        return roomMapper.toResponseList(roomRepository.findAvailableRooms());
    }

    // Sửa method getRoomsByStatus
    public List<RoomResponse> getRoomsByStatus(RoomStatus status) {
        return roomMapper.toResponseList(roomRepository.findByStatusAndDeletedFalse(status));
    }


    // Lấy phòng theo ID
    public RoomResponse getRoomById(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        return roomMapper.toResponse(room);
    }

    // Lấy entity Room theo ID (dùng cho các service khác)
    public Room getRoomEntityById(UUID id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
    }

    // Tạo phòng mới
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        if (roomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new AppException(ErrorCode.ROOM_ALREADY_EXISTS);
        }

        Room room = Room.builder()
                .roomNumber(request.getRoomNumber().trim().toUpperCase())
                .floor(request.getFloor())
                .building(request.getBuilding())
                .status(RoomStatus.AVAILABLE)
                .build();

        log.info("==> [ROOM] Tạo phòng mới: {}", room.getRoomNumber());
        return roomMapper.toResponse(roomRepository.save(room));
    }

    // Cập nhật trạng thái phòng (khi bác sĩ bắt đầu khám)
    @Transactional
    public void occupyRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new AppException(ErrorCode.ROOM_NOT_AVAILABLE);
        }

        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);
    }

    // Giải phóng phòng (khi kết thúc khám)
    @Transactional
    public void releaseRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        // Kiểm tra phòng có đang được sử dụng không
        if (!RoomStatus.OCCUPIED.equals(room.getStatus()) && !RoomStatus.MAINTENANCE.equals(room.getStatus())) {
            // Nếu phòng đang AVAILABLE thì không cần giải phóng
            if (RoomStatus.AVAILABLE.equals(room.getStatus())) {
                return;
            }
        }

        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        log.info("==> [ROOM] Phòng {} đã được giải phóng", room.getRoomNumber());
    }

    // Đưa phòng vào bảo trì
    @Transactional
    public void setRoomMaintenance(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (RoomStatus.OCCUPIED.equals(room.getStatus())) {
            throw new AppException(ErrorCode.ROOM_IS_OCCUPIED);
        }

        room.setStatus(RoomStatus.MAINTENANCE);
        roomRepository.save(room);

        log.info("==> [ROOM] Phòng {} đã được chuyển sang bảo trì", room.getRoomNumber());
    }

    // Xóa phòng
    @Transactional
    public void deleteRoom(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        // Không cho xóa phòng đang được sử dụng
        if (RoomStatus.OCCUPIED.equals(room.getStatus())) {
            throw new AppException(ErrorCode.ROOM_IS_OCCUPIED);
        }

        // Soft delete - chỉ đánh dấu deleted = true
        room.setDeleted(true);
        roomRepository.save(room);

        log.info("==> [ROOM] Đã xóa mềm phòng: {}", room.getRoomNumber());
    }

    @Transactional
    public void restoreRoom(UUID id) {
        Room room = roomRepository.findByIdIncludingDeleted(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!room.isDeleted()) {
            throw new AppException(ErrorCode.ROOM_NOT_DELETED);
        }

        room.setDeleted(false);
        roomRepository.save(room);

        log.info("==> [ROOM] Đã khôi phục phòng: {}", room.getRoomNumber());
    }

    // Kiểm tra phòng có tồn tại không
    public boolean existsById(UUID id) {
        return roomRepository.findById(id).isPresent();
    }

    // Kiểm tra phòng có khả dụng không
    public boolean isRoomAvailable(UUID roomId) {
        return roomRepository.findById(roomId)
                .map(room -> RoomStatus.AVAILABLE.equals(room.getStatus()))
                .orElse(false);
    }

    // Cập nhật phòng
    @Transactional
    public RoomResponse updateRoom(UUID id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        // Kiểm tra số phòng mới có bị trùng không (nếu thay đổi số phòng)
        if (!room.getRoomNumber().equals(request.getRoomNumber()) &&
                roomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new AppException(ErrorCode.ROOM_ALREADY_EXISTS);
        }

        room.setRoomNumber(request.getRoomNumber().trim().toUpperCase());
        room.setFloor(request.getFloor());
        room.setBuilding(request.getBuilding());

        log.info("==> [ROOM] Cập nhật phòng: {}", room.getRoomNumber());
        return roomMapper.toResponse(roomRepository.save(room));
    }

    // Kích hoạt phòng
    @Transactional
    public void activateRoom(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        log.info("==> [ROOM] Đã kích hoạt phòng: {}", room.getRoomNumber());
    }
}