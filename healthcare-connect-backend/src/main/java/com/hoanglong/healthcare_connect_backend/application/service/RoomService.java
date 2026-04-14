package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.RoomRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.RoomResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.RoomMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Room;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {
    private final IRoomRepository roomRepository;
    private final RoomMapper roomMapper;

    public List<RoomResponse> getAllRooms() {
        return roomMapper.toResponseList(roomRepository.findAll());
    }

    public List<RoomResponse> getAvailableRooms() {
        return roomMapper.toResponseList(roomRepository.findAllByStatus("AVAILABLE"));
    }

    public List<RoomResponse> getRoomsByStatus(String status) {
        return roomMapper.toResponseList(roomRepository.findAllByStatus(status));
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
                .status("AVAILABLE")
                .build();

        log.info("==> [ROOM] Tạo phòng mới: {}", room.getRoomNumber());
        return roomMapper.toResponse(roomRepository.save(room));
    }

    // Cập nhật trạng thái phòng (khi bác sĩ bắt đầu khám)
    @Transactional
    public void occupyRoom(UUID roomId, UUID appointmentId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        // Kiểm tra phòng có đang khả dụng không
        if (!"AVAILABLE".equals(room.getStatus())) {
            throw new AppException(ErrorCode.ROOM_NOT_AVAILABLE);
        }

        room.setStatus("OCCUPIED");
        room.setCurrentAppointmentId(appointmentId);
        roomRepository.save(room);

        log.info("==> [ROOM] Phòng {} đã được chiếm bởi appointment {}", room.getRoomNumber(), appointmentId);
    }

    // Giải phóng phòng (khi kết thúc khám)
    @Transactional
    public void releaseRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        // Kiểm tra phòng có đang được sử dụng không
        if (!"OCCUPIED".equals(room.getStatus()) && !"MAINTENANCE".equals(room.getStatus())) {
            // Nếu phòng đang AVAILABLE thì không cần giải phóng
            if ("AVAILABLE".equals(room.getStatus())) {
                return;
            }
        }

        room.setStatus("AVAILABLE");
        room.setCurrentAppointmentId(null);
        roomRepository.save(room);

        log.info("==> [ROOM] Phòng {} đã được giải phóng", room.getRoomNumber());
    }

    // Đưa phòng vào bảo trì
    @Transactional
    public void setRoomMaintenance(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if ("OCCUPIED".equals(room.getStatus())) {
            throw new AppException(ErrorCode.ROOM_IS_OCCUPIED);
        }

        room.setStatus("MAINTENANCE");
        room.setCurrentAppointmentId(null);
        roomRepository.save(room);

        log.info("==> [ROOM] Phòng {} đã được chuyển sang bảo trì", room.getRoomNumber());
    }

    // Xóa phòng
    @Transactional
    public void deleteRoom(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        // Không cho xóa phòng đang được sử dụng
        if ("OCCUPIED".equals(room.getStatus())) {
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
                .map(room -> "AVAILABLE".equals(room.getStatus()))
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

    // Kích hoạt phòng (chuyển từ MAINTENANCE hoặc OCCUPIED -> AVAILABLE)
    @Transactional
    public void activateRoom(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        room.setStatus("AVAILABLE");
        room.setCurrentAppointmentId(null);
        roomRepository.save(room);

        log.info("==> [ROOM] Đã kích hoạt phòng: {}", room.getRoomNumber());
    }

}