package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.WorkingHoursRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.WorkingHoursResponse;
import com.hoanglong.healthcare_connect_backend.application.service.HospitalWorkingHoursService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/working-hours")
@RequiredArgsConstructor
@Slf4j
public class ManagerWorkingHoursController {

    private final HospitalWorkingHoursService workingHoursService;

    /**
     * Lấy tất cả cấu hình giờ làm việc của bệnh viện hiện tại
     */
    @GetMapping
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<WorkingHoursResponse>> getWorkingHours() {
        log.info("API: Lấy cấu hình giờ làm việc của bệnh viện");
        return ApiResponse.<List<WorkingHoursResponse>>builder()
                .status("success")
                .code(200)
                .message("Lấy cấu hình giờ làm việc thành công!")
                .data(workingHoursService.getWorkingHoursByCurrentHospital())
                .build();
    }

    /**
     * Lấy cấu hình giờ làm việc theo ngày cụ thể
     */
    @GetMapping("/day")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<WorkingHoursResponse> getWorkingHoursByDay(@RequestParam Integer dayOfWeek) {
        log.info("API: Lấy cấu hình giờ làm việc theo ngày: {}", dayOfWeek);
        return ApiResponse.<WorkingHoursResponse>builder()
                .status("success")
                .code(200)
                .message("Lấy cấu hình giờ làm việc thành công!")
                .data(workingHoursService.getWorkingHoursByDay(dayOfWeek))
                .build();
    }

    /**
     * Tạo hoặc cập nhật cấu hình giờ làm việc cho một ngày
     */
    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<WorkingHoursResponse> saveWorkingHours(@Valid @RequestBody WorkingHoursRequest request) {
        log.info("API: Tạo/cập nhật cấu hình giờ làm việc cho ngày: {}", request.getDayOfWeek());
        return ApiResponse.<WorkingHoursResponse>builder()
                .status("success")
                .code(200)
                .message("Lưu cấu hình giờ làm việc thành công!")
                .data(workingHoursService.saveWorkingHours(request))
                .build();
    }

    /**
     * Xóa (vô hiệu hóa) cấu hình giờ làm việc của một ngày
     */
    @DeleteMapping
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Void> deactivateWorkingHours(@RequestParam Integer dayOfWeek) {
        log.info("API: Xóa cấu hình giờ làm việc cho ngày: {}", dayOfWeek);
        workingHoursService.deactivateWorkingHours(dayOfWeek);
        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Xóa cấu hình giờ làm việc thành công!")
                .build();
    }

    /**
     * Khôi phục cấu hình mặc định cho tất cả các ngày
     */
    @PostMapping("/reset-default")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Void> resetToDefault() {
        log.info("API: Khôi phục cấu hình giờ làm việc mặc định");
        workingHoursService.resetToDefault();
        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Đã khôi phục cấu hình giờ làm việc mặc định!")
                .build();
    }
}