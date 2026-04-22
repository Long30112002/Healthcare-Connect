package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicineRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicineResponse;
import com.hoanglong.healthcare_connect_backend.application.service.MedicineService;
import com.hoanglong.healthcare_connect_backend.core.constant.MedicineCategory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
@Slf4j
public class MedicineController {

    private final MedicineService medicineService;

    // ==================== CREATE ====================

    /**
     * Tạo thuốc mới
     * POST /api/medicines
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public ApiResponse<MedicineResponse> createMedicine(
            @Valid @RequestBody MedicineRequest request
    ) {
        log.info("API: Tạo thuốc mới với code: {}", request.getCode());

        MedicineResponse response = medicineService.createMedicine(request);

        return ApiResponse.<MedicineResponse>builder()
                .status("success")
                .code(HttpStatus.CREATED.value())
                .message("Tạo thuốc thành công!")
                .data(response)
                .build();
    }

    // ==================== READ ====================

    /**
     * Lấy danh sách thuốc (phân trang)
     * GET /api/medicines?page=0&size=20&sortBy=name&direction=asc
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'HOSPITAL_MANAGER')")
    public ApiResponse<Page<MedicineResponse>> getAllMedicines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        log.info("API: Lấy danh sách thuốc, page={}, size={}", page, size);

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<MedicineResponse> responses = medicineService.getAllMedicines(pageable);

        return ApiResponse.<Page<MedicineResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách thuốc thành công!")
                .data(responses)
                .build();
    }

    /**
     * Lấy thuốc theo ID
     * GET /api/medicines/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'HOSPITAL_MANAGER')")
    public ApiResponse<MedicineResponse> getMedicineById(@PathVariable UUID id) {
        log.info("API: Lấy thuốc theo ID: {}", id);

        MedicineResponse response = medicineService.getMedicineById(id);

        return ApiResponse.<MedicineResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin thuốc thành công!")
                .data(response)
                .build();
    }

    /**
     * Lấy thuốc theo mã
     * GET /api/medicines/code/{code}
     */
    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'HOSPITAL_MANAGER')")
    public ApiResponse<MedicineResponse> getMedicineByCode(@PathVariable String code) {
        log.info("API: Lấy thuốc theo code: {}", code);

        MedicineResponse response = medicineService.getMedicineByCode(code);

        return ApiResponse.<MedicineResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin thuốc thành công!")
                .data(response)
                .build();
    }

    /**
     * Tìm kiếm thuốc
     * GET /api/medicines/search?keyword=amoxicillin&page=0&size=20
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'HOSPITAL_MANAGER')")
    public ApiResponse<Page<MedicineResponse>> searchMedicines(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("API: Tìm kiếm thuốc với keyword: {}", keyword);

        Pageable pageable = PageRequest.of(page, size);
        Page<MedicineResponse> responses = medicineService.searchMedicines(keyword, pageable);

        return ApiResponse.<Page<MedicineResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Tìm kiếm thuốc thành công!")
                .data(responses)
                .build();
    }

    /**
     * Tìm kiếm nâng cao
     * GET /api/medicines/advanced-search?name=amox&category=ANTIBIOTIC&requiresPrescription=true
     */
    @GetMapping("/advanced-search")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'HOSPITAL_MANAGER')")
    public ApiResponse<Page<MedicineResponse>> advancedSearch(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) MedicineCategory category,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) Boolean requiresPrescription,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("API: Tìm kiếm nâng cao thuốc");

        Pageable pageable = PageRequest.of(page, size);
        Page<MedicineResponse> responses = medicineService.advancedSearch(
                name, category, hospitalId, requiresPrescription, pageable);

        return ApiResponse.<Page<MedicineResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Tìm kiếm thuốc thành công!")
                .data(responses)
                .build();
    }

    /**
     * Lọc thuốc theo danh mục
     * GET /api/medicines/category/{category}
     */
    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'HOSPITAL_MANAGER')")
    public ApiResponse<Page<MedicineResponse>> getByCategory(
            @PathVariable MedicineCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("API: Lấy thuốc theo danh mục: {}", category);

        Pageable pageable = PageRequest.of(page, size);
        Page<MedicineResponse> responses = medicineService.getMedicinesByCategory(category, pageable);

        return ApiResponse.<Page<MedicineResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách thuốc theo danh mục thành công!")
                .data(responses)
                .build();
    }

    /**
     * Lấy thuốc kê đơn
     * GET /api/medicines/prescription-only
     */
    @GetMapping("/prescription-only")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'HOSPITAL_MANAGER')")
    public ApiResponse<Page<MedicineResponse>> getPrescriptionMedicines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("API: Lấy thuốc kê đơn");

        Pageable pageable = PageRequest.of(page, size);
        Page<MedicineResponse> responses = medicineService.getPrescriptionMedicines(pageable);

        return ApiResponse.<Page<MedicineResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách thuốc kê đơn thành công!")
                .data(responses)
                .build();
    }

    /**
     * Lấy thuốc tồn kho thấp
     * GET /api/medicines/low-stock
     */
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public ApiResponse<List<MedicineResponse>> getLowStockMedicines() {
        log.info("API: Lấy danh sách thuốc tồn kho thấp");

        List<MedicineResponse> responses = medicineService.getLowStockMedicines();

        return ApiResponse.<List<MedicineResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách thuốc tồn kho thấp thành công!")
                .data(responses)
                .build();
    }

    /**
     * Lấy thuốc sắp hết hạn
     * GET /api/medicines/expiring
     */
    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public ApiResponse<List<MedicineResponse>> getExpiringMedicines() {
        log.info("API: Lấy danh sách thuốc sắp hết hạn");

        List<MedicineResponse> responses = medicineService.getExpiringMedicines();

        return ApiResponse.<List<MedicineResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách thuốc sắp hết hạn thành công!")
                .data(responses)
                .build();
    }

    // ==================== UPDATE ====================

    /**
     * Cập nhật thuốc
     * PUT /api/medicines/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public ApiResponse<MedicineResponse> updateMedicine(
            @PathVariable UUID id,
            @Valid @RequestBody MedicineRequest request
    ) {
        log.info("API: Cập nhật thuốc ID: {}", id);

        MedicineResponse response = medicineService.updateMedicine(id, request);

        return ApiResponse.<MedicineResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Cập nhật thuốc thành công!")
                .data(response)
                .build();
    }

    /**
     * Cập nhật số lượng tồn kho
     * PATCH /api/medicines/{id}/stock?quantity=100
     */
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public ApiResponse<Void> updateStock(
            @PathVariable UUID id,
            @RequestParam int quantity
    ) {
        log.info("API: Cập nhật stock thuốc ID: {}, quantity: {}", id, quantity);

        medicineService.updateStock(id, quantity);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Cập nhật tồn kho thành công!")
                .build();
    }

    /**
     * Kiểm tra tồn kho
     * GET /api/medicines/{id}/check-stock?quantity=10
     */
    @GetMapping("/{id}/check-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'HOSPITAL_MANAGER')")
    public ApiResponse<Boolean> checkStock(
            @PathVariable UUID id,
            @RequestParam int quantity
    ) {
        log.info("API: Kiểm tra stock thuốc ID: {}, quantity: {}", id, quantity);

        boolean hasStock = medicineService.checkStock(id, quantity);

        return ApiResponse.<Boolean>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message(hasStock ? "Đủ hàng" : "Không đủ hàng")
                .data(hasStock)
                .build();
    }

    // ==================== DELETE ====================

    /**
     * Xóa thuốc
     * DELETE /api/medicines/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public ApiResponse<Void> deleteMedicine(@PathVariable UUID id) {
        log.info("API: Xóa thuốc ID: {}", id);

        medicineService.deleteMedicine(id);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Xóa thuốc thành công!")
                .build();
    }
}