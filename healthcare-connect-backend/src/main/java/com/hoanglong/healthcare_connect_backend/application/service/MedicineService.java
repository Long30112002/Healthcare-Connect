package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicineRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicineResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.MedicineMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.MedicineCategory;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.Medicine;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.MedicineRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final HospitalRepository hospitalRepository;
    private final MedicineMapper medicineMapper;
    private final CurrentUserService currentUserService;

    /**
     * Tạo thuốc mới (Chỉ ADMIN hoặc HOSPITAL_MANAGER)
     */
    public MedicineResponse createMedicine(MedicineRequest request) {
        log.info("Tạo thuốc mới với code: {}", request.getCode());

        // Kiểm tra quyền
        checkAdminOrManagerPermission();

        // Kiểm tra mã thuốc đã tồn tại trong BỆNH VIỆN NÀY chưa
        boolean exists = medicineRepository.existsByCodeAndHospitalIdAndDeletedFalse(
                request.getCode(),
                request.getHospitalId()
        );

        if (exists) {
            throw new AppException(ErrorCode.MEDICINE_ALREADY_EXISTS_IN_HOSPITAL);
        }

        // Lấy hospital
        Hospital hospital = getHospitalById(request.getHospitalId());

        // Kiểm tra hospital thuộc quyền quản lý (nếu là MANAGER)
        checkHospitalOwnership(hospital.getId());

        // Convert request -> entity
        Medicine medicine = medicineMapper.toEntity(request);
        medicine.setHospital(hospital);

        // lưu vào database
        Medicine savedMedicine = medicineRepository.save(medicine);
        log.info("Đã tạo thuốc thành công với ID: {}", savedMedicine.getId());

        return medicineMapper.toResponse(savedMedicine);
    }

    /**
     * Cập nhật thông tin thuốc
     */
    public MedicineResponse updateMedicine(UUID id, MedicineRequest request) {
        log.info("Cập nhật thuốc ID: {}", id);

        // 1. Kiểm tra quyền
        checkAdminOrManagerPermission();

        // 2. Tìm thuốc
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

        // 3. Kiểm tra hospital thuộc quyền quản lý
        checkHospitalOwnership(medicine.getHospital().getId());

        // 4. Kiểm tra mã thuốc trùng (nếu đổi code)
        if (!medicine.getCode().equals(request.getCode()) &&
                medicineRepository.existsByCodeAndDeletedFalse(request.getCode())) {
            throw new AppException(ErrorCode.MEDICINE_ALREADY_EXISTS);
        }

        // 5. Cập nhật
        medicineMapper.updateEntity(medicine, request);

        // Cập nhật hospital nếu thay đổi
        if (!medicine.getHospital().getId().equals(request.getHospitalId())) {
            Hospital newHospital = getHospitalById(request.getHospitalId());
            checkHospitalOwnership(newHospital.getId());
            medicine.setHospital(newHospital);
        }

        Medicine savedMedicine = medicineRepository.save(medicine);
        log.info("Đã cập nhật thuốc ID: {}", savedMedicine.getId());

        return medicineMapper.toResponse(savedMedicine);
    }

    /**
     * Xóa thuốc (Soft delete)
     */
    public void deleteMedicine(UUID id) {
        log.info("Xóa thuốc ID: {}", id);

        // 1. Kiểm tra quyền
        checkAdminOrManagerPermission();

        // 2. Tìm thuốc
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

        // 3. Kiểm tra hospital thuộc quyền quản lý
        checkHospitalOwnership(medicine.getHospital().getId());

        // 4. Soft delete
        medicineRepository.softDeleteById(id);
        log.info("Đã xóa thuốc ID: {}", id);
    }

    /**
     * Lấy thuốc theo ID (có kiểm tra quyền)
     */
    public MedicineResponse getMedicineById(UUID id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

        // Kiểm tra quyền xem
        checkViewPermission(medicine.getHospital().getId());

        return medicineMapper.toResponse(medicine);
    }

    /**
     * Lấy tất cả thuốc của bệnh viện hiện tại (có phân trang)
     */
    public Page<MedicineResponse> getAllMedicines(Pageable pageable) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();

        if (isAdmin()) {
            // Admin thấy tất cả thuốc của tất cả bệnh viện
            return medicineRepository.findAll(pageable)
                    .map(medicineMapper::toResponse);
        }

        // Manager, Doctor, Receptionist chỉ thấy thuốc của bệnh viện mình
        if (hospitalId == null) {
            throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
        }

        return medicineRepository.findByHospitalIdAndDeletedFalse(hospitalId, pageable)
                .map(medicineMapper::toResponse);
    }

    /**
     * Tìm kiếm thuốc theo keyword
     */
    public Page<MedicineResponse> searchMedicines(String keyword, Pageable pageable) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();

        if (isAdmin()) {
            return medicineRepository.search(keyword, pageable)
                    .map(medicineMapper::toResponse);
        }

        if (hospitalId == null) {
            throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
        }

        // Tìm kiếm trong bệnh viện hiện tại
        return medicineRepository.search(keyword, pageable)
                .map(medicineMapper::toResponse);
    }

    /**
     * Tìm kiếm nâng cao
     */
    public Page<MedicineResponse> advancedSearch(String name, MedicineCategory category,
            UUID hospitalId, Boolean requiresPrescription,
            Pageable pageable) {
        // Nếu không phải admin, chỉ tìm trong bệnh viện của mình
        if (!isAdmin()) {
            UUID currentHospitalId = currentUserService.getCurrentHospitalId();
            if (currentHospitalId == null) {
                throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
            }
            hospitalId = currentHospitalId;
        }

        return medicineRepository.advancedSearch(name, category, hospitalId, requiresPrescription, pageable)
                .map(medicineMapper::toResponse);
    }

    /**
     * Lấy thuốc theo danh mục
     */
    public Page<MedicineResponse> getMedicinesByCategory(MedicineCategory category, Pageable pageable) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();

        if (isAdmin()) {
            return medicineRepository.findByCategoryAndDeletedFalse(category, pageable)
                    .map(medicineMapper::toResponse);
        }

        if (hospitalId == null) {
            throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
        }

        return medicineRepository.findByCategoryAndDeletedFalse(category, pageable)
                .map(medicineMapper::toResponse);
    }

    /**
     * Lấy thuốc kê đơn
     */
    public Page<MedicineResponse> getPrescriptionMedicines(Pageable pageable) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();

        if (isAdmin()) {
            return medicineRepository.findByRequiresPrescriptionTrueAndDeletedFalse(pageable)
                    .map(medicineMapper::toResponse);
        }

        if (hospitalId == null) {
            throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
        }

        return medicineRepository.findByRequiresPrescriptionTrueAndDeletedFalse(pageable)
                .map(medicineMapper::toResponse);
    }

    /**
     * Lấy danh sách thuốc tồn kho thấp
     */
    public List<MedicineResponse> getLowStockMedicines() {
        UUID hospitalId = currentUserService.getCurrentHospitalId();

        if (isAdmin()) {
            return medicineRepository.findLowStockMedicines().stream()
                    .map(medicineMapper::toResponse)
                    .toList();
        }

        if (hospitalId == null) {
            throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
        }

        // Lọc theo bệnh viện
        return medicineRepository.findLowStockMedicines().stream()
                .filter(m -> m.getHospital().getId().equals(hospitalId))
                .map(medicineMapper::toResponse)
                .toList();
    }

    /**
     * Lấy danh sách thuốc sắp hết hạn
     */
    public List<MedicineResponse> getExpiringMedicines() {
        LocalDate thirtyDaysLater = LocalDate.now().plusDays(30);
        UUID hospitalId = currentUserService.getCurrentHospitalId();

        List<Medicine> medicines;
        if (isAdmin()) {
            medicines = medicineRepository.findByExpiryDateBeforeAndDeletedFalse(thirtyDaysLater);
        } else {
            if (hospitalId == null) {
                throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
            }
            medicines = medicineRepository.findByExpiryDateBeforeAndDeletedFalse(thirtyDaysLater);
            medicines = medicines.stream()
                    .filter(m -> m.getHospital().getId().equals(hospitalId))
                    .toList();
        }

        return medicines.stream()
                .map(medicineMapper::toResponse)
                .toList();
    }

    /**
     * Cập nhật số lượng tồn kho
     */
    public void updateStock(UUID medicineId, int quantity) {
        log.info("Cập nhật stock thuốc ID: {}, quantity: {}", medicineId, quantity);

        // 1. Kiểm tra quyền
        checkAdminOrManagerPermission();

        // 2. Tìm thuốc
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

        // 3. Kiểm tra hospital thuộc quyền quản lý
        checkHospitalOwnership(medicine.getHospital().getId());

        // 4. Cập nhật stock (cộng hoặc trừ)
        int newStock = medicine.getStockQuantity() + quantity;
        if (newStock < 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }

        medicine.setStockQuantity(newStock);
        medicineRepository.save(medicine);

        log.info("Đã cập nhật stock thuốc ID: {}, stock mới: {}", medicineId, newStock);
    }

    /**
     * Kiểm tra tồn kho
     */
    public boolean checkStock(UUID medicineId, int requiredQuantity) {
        return medicineRepository.hasSufficientStock(medicineId, requiredQuantity);
    }

    /**
     * Lấy thuốc theo code
     */
    public MedicineResponse getMedicineByCode(String code) {
        Medicine medicine = medicineRepository.findByCodeAndDeletedFalse(code)
                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

        checkViewPermission(medicine.getHospital().getId());

        return medicineMapper.toResponse(medicine);
    }


    private Hospital getHospitalById(UUID hospitalId) {
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));
    }

    private void checkAdminOrManagerPermission() {
        String role = SecurityUtils.getCurrentUserRole();
        if (!role.equals("ROLE_ADMIN") && !role.equals("ROLE_HOSPITAL_MANAGER")) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private void checkHospitalOwnership(UUID hospitalId) {
        String role = SecurityUtils.getCurrentUserRole();

        // Admin có thể làm mọi thứ
        if (role.equals("ROLE_ADMIN")) {
            return;
        }

        // Manager chỉ được làm trên bệnh viện của mình
        if (role.equals("ROLE_HOSPITAL_MANAGER")) {
            UUID currentHospitalId = currentUserService.getCurrentHospitalId();
            if (currentHospitalId == null || !currentHospitalId.equals(hospitalId)) {
                throw new AppException(ErrorCode.NOT_HOSPITAL_MANAGER);
            }
            return;
        }

        throw new AppException(ErrorCode.FORBIDDEN);
    }

    private void checkViewPermission(UUID hospitalId) {
        String role = SecurityUtils.getCurrentUserRole();

        // Admin xem được tất cả
        if (role.equals("ROLE_ADMIN")) {
            return;
        }

        // Patient chỉ xem được thuốc của bệnh viện mình đang khám?
        // Thực tế patient không cần xem danh sách thuốc, chỉ xem trong đơn thuốc
        if (role.equals("ROLE_PATIENT")) {
            return; // Cho phép xem
        }

        // Doctor, Manager, Receptionist chỉ xem được thuốc của bệnh viện mình
        UUID currentHospitalId = currentUserService.getCurrentHospitalId();
        if (currentHospitalId == null || !currentHospitalId.equals(hospitalId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private boolean isAdmin() {
        return SecurityUtils.getCurrentUserRole().equals("ROLE_ADMIN");
    }
}