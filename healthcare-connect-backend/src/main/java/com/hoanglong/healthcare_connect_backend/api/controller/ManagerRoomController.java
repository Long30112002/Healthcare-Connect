package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.room.RoomRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.room.RoomResponse;
import com.hoanglong.healthcare_connect_backend.application.service.CurrentUserService;
import com.hoanglong.healthcare_connect_backend.application.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager/rooms")
@RequiredArgsConstructor
@Slf4j
public class ManagerRoomController {

    private final RoomService roomService;
    private final CurrentUserService currentUserService;

    // Lấy danh sách phòng của bệnh viện hiện tại
    @GetMapping
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<RoomResponse>> getAllRooms() {
        log.info("API: Lấy danh sách phòng khám cho Manager");
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        List<RoomResponse> rooms = roomService.getRoomsByHospital(hospitalId);
        return ApiResponse.<List<RoomResponse>>builder()
                .status("success")
                .code(200)
                .data(rooms)
                .build();
    }

    // Tạo phòng mới
    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        log.info("API: Tạo phòng mới: {}", request.getRoomNumber());
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        RoomResponse room = roomService.createRoomForHospital(hospitalId, request);
        return ApiResponse.<RoomResponse>builder()
                .status("success")
                .code(201)
                .message("Tạo phòng thành công")
                .data(room)
                .build();
    }

    // Cập nhật phòng
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<RoomResponse> updateRoom(@PathVariable UUID id, @Valid @RequestBody RoomRequest request) {
        log.info("API: Cập nhật phòng id={}", id);
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        RoomResponse room = roomService.updateRoomForHospital(id, hospitalId, request);
        return ApiResponse.<RoomResponse>builder()
                .status("success")
                .code(200)
                .message("Cập nhật phòng thành công")
                .data(room)
                .build();
    }

    // Xóa phòng (soft delete)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Void> deleteRoom(@PathVariable UUID id) {
        log.info("API: Xóa phòng id={}", id);
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        roomService.deleteRoomForHospital(id, hospitalId);
        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Xóa phòng thành công")
                .build();
    }

    // Đưa phòng vào bảo trì
    @PatchMapping("/{id}/maintenance")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Void> setMaintenance(@PathVariable UUID id) {
        log.info("API: Đưa phòng {} vào bảo trì", id);
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        roomService.setRoomMaintenance(id, hospitalId);
        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Đã chuyển phòng sang bảo trì")
                .build();
    }

    // Kích hoạt phòng (từ bảo trì sang khả dụng)
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Void> activateRoom(@PathVariable UUID id) {
        log.info("API: Kích hoạt phòng {}", id);
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        roomService.activateRoom(id, hospitalId);
        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Kích hoạt phòng thành công")
                .build();
    }
}