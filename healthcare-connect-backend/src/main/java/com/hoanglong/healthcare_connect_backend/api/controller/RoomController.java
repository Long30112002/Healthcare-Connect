package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.room.RoomRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.room.RoomResponse;
import com.hoanglong.healthcare_connect_backend.application.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    // 1. Lấy tất cả phòng (chưa xóa)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ApiResponse<List<RoomResponse>> getAllRooms() {
        return ApiResponse.<List<RoomResponse>>builder()
                .status("success")
                .code(200)
                .data(roomService.getAllRooms())
                .build();
    }

    // 2. Lấy phòng khả dụng (AVAILABLE)
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ApiResponse<List<RoomResponse>> getAvailableRooms() {
        return ApiResponse.<List<RoomResponse>>builder()
                .status("success")
                .code(200)
                .data(roomService.getAvailableRooms())
                .build();
    }

    // 3. Lấy phòng theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ApiResponse<RoomResponse> getRoomById(@PathVariable UUID id) {
        return ApiResponse.<RoomResponse>builder()
                .status("success")
                .code(200)
                .data(roomService.getRoomById(id))
                .build();
    }

    // 4. Tạo phòng mới
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        return ApiResponse.<RoomResponse>builder()
                .status("success")
                .code(201)
                .message("Tạo phòng thành công")
                .data(roomService.createRoom(request))
                .build();
    }

    // 5. Cập nhật phòng
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<RoomResponse> updateRoom(@PathVariable UUID id,
            @Valid @RequestBody RoomRequest request) {
        return ApiResponse.<RoomResponse>builder()
                .status("success")
                .code(200)
                .message("Cập nhật phòng thành công")
                .data(roomService.updateRoom(id, request))
                .build();
    }

    // 6. Xóa phòng (soft delete)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteRoom(@PathVariable UUID id) {
        roomService.deleteRoom(id);
        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .message("Xóa phòng thành công")
                .build();
    }

    // 7. Khôi phục phòng đã xóa
    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> restoreRoom(@PathVariable UUID id) {
        roomService.restoreRoom(id);
        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .message("Khôi phục phòng thành công")
                .build();
    }

//    // 8. Đưa phòng vào bảo trì
//    @PatchMapping("/{id}/maintenance")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ApiResponse<String> setRoomMaintenance(@PathVariable UUID id) {
//        roomService.setRoomMaintenance(id);
//        return ApiResponse.<String>builder()
//                .status("success")
//                .code(200)
//                .message("Chuyển phòng sang bảo trì thành công")
//                .build();
//    }

    // 9. Đưa phòng trở lại hoạt động (từ bảo trì hoặc OCCUPIED -> AVAILABLE)
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> activateRoom(@PathVariable UUID id) {
        roomService.activateRoom(id);
        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .message("Kích hoạt phòng thành công")
                .build();
    }
}