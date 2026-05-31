package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.admin.*;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.AdminDashboardStats;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.AdminDoctorListResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.TopHospitalResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.UserTrendDTO;
import com.hoanglong.healthcare_connect_backend.application.dto.user.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.service.AdminService;
import com.hoanglong.healthcare_connect_backend.application.service.UserService;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController
{
    private final UserService userService;
    private final AdminService adminService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN mới xem được hết
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .status("success")
                .code(200)
                .data(userService.getAll())
                .build();
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AdminDashboardStats> getDashboardStats() {
        AdminDashboardStats stats = adminService.getDashboardStats();
        return ApiResponse.<AdminDashboardStats>builder()
                .status("success")
                .code(200)
                .data(stats)
                .build();
    }

    @GetMapping("/statistics/user-trend")
    public ApiResponse<List<UserTrendDTO>> getUserTrend() {
        return ApiResponse.<List<UserTrendDTO>>builder()
                .status("success")
                .code(200)
                .data(adminService.getUserTrend())
                .build();
    }

    @GetMapping("/hospitals/top")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<TopHospitalResponse>> getTopHospitals(
            @RequestParam(defaultValue = "5") int limit) {
        return ApiResponse.<List<TopHospitalResponse>>builder()
                .status("success")
                .code(200)
                .data(adminService.getTopHospitals(limit))
                .build();
    }

    @GetMapping("/users")
    public ApiResponse<Page<AdminUserListResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Page<AdminUserListResponse> users = adminService.getUsers(page, size, keyword, role, enabled, sortBy, sortDir);

        return ApiResponse.<Page<AdminUserListResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách người dùng thành công!")
                .data(users)
                .build();
    }

    @GetMapping("/users/{id}")
    public ApiResponse<AdminUserDetailResponse> getUserDetail(@PathVariable UUID id) {
        AdminUserDetailResponse userDetail = adminService.getUserDetail(id);

        return ApiResponse.<AdminUserDetailResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy chi tiết người dùng thành công!")
                .data(userDetail)
                .build();
    }

    @PatchMapping("/users/{id}/toggle-status")
    public ApiResponse<Boolean> toggleUserStatus(
            @PathVariable UUID id,
            @RequestBody(required = false) ToggleUserStatusRequest request) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        String reason = request != null ? request.getReason() : null;
        Boolean newStatus = adminService.toggleUserStatus(id, reason, adminId);
        String message = newStatus ? "Tài khoản đã được mở khóa!" : "Tài khoản đã bị khóa!";
        return ApiResponse.<Boolean>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message(message)
                .data(newStatus)
                .build();
    }

    @PostMapping("/users/{id}/reset-password")
    public ApiResponse<Void> resetUserPassword(@PathVariable UUID id) {
        adminService.resetUserPassword(id);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Email hướng dẫn đặt lại mật khẩu đã được gửi!")
                .build();
    }

    @GetMapping("/users/export")
    public ResponseEntity<byte[]> exportUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled) {

        byte[] excelData = adminService.exportUsersToExcel(keyword, role, enabled);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=users_" + LocalDate.now() + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<AdminDoctorListResponse>> getDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String hospitalId,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Page<AdminDoctorListResponse> doctors = adminService.getDoctors(page, size, keyword, status, hospitalId, sortBy, sortDir);

        return ApiResponse.<Page<AdminDoctorListResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách bác sĩ thành công!")
                .data(doctors)
                .build();
    }

    @GetMapping("/doctors/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportDoctors(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String hospitalId) {

        byte[] excelData = adminService.exportDoctorsToExcel(keyword, status, hospitalId);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=doctors_" + LocalDate.now() + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }

    @GetMapping("/hospitals")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<AdminHospitalListResponse>> getHospitals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Page<AdminHospitalListResponse> hospitals = adminService.getHospitals(page, size, keyword, sortBy, sortDir);

        return ApiResponse.<Page<AdminHospitalListResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách bệnh viện thành công!")
                .data(hospitals)
                .build();
    }

    @GetMapping("/hospitals/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AdminHospitalDetailResponse> getHospitalDetail(@PathVariable UUID id) {
        AdminHospitalDetailResponse hospital = adminService.getHospitalDetail(id);

        return ApiResponse.<AdminHospitalDetailResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy chi tiết bệnh viện thành công!")
                .data(hospital)
                .build();
    }

    @PostMapping("/hospitals")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AdminHospitalDetailResponse> createHospital(@Valid @RequestBody HospitalRequest request) {
        AdminHospitalDetailResponse hospital = adminService.createHospital(request);

        return ApiResponse.<AdminHospitalDetailResponse>builder()
                .status("success")
                .code(HttpStatus.CREATED.value())
                .message("Tạo bệnh viện thành công! Email mời đã được gửi.")
                .data(hospital)
                .build();
    }

    @DeleteMapping("/hospitals/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteHospital(@PathVariable UUID id) {
        adminService.deleteHospital(id);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Xóa bệnh viện thành công!")
                .build();
    }

    @GetMapping("/hospitals/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportHospitals(
            @RequestParam(required = false) String keyword) {

        byte[] excelData = adminService.exportHospitalsToExcel(keyword);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=hospitals_" + LocalDate.now() + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }

    @PostMapping("/hospitals/{id}/resend-invitation")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> resendInvitation(@PathVariable UUID id) {
        adminService.resendInvitation(id);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Đã gửi lại email mời thành công!")
                .build();
    }
}
