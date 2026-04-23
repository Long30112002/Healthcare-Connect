package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.MedicineCategory;
import com.hoanglong.healthcare_connect_backend.core.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, UUID>
{

    // Tìm theo code
    Optional<Medicine> findByCodeAndDeletedFalse(String code);

    boolean existsByCodeAndDeletedFalse(String code);

    // Tìm theo tên (contains)
    Page<Medicine> findByNameContainingIgnoreCaseAndDeletedFalse(String name, Pageable pageable);

    // Tìm theo category
    Page<Medicine> findByCategoryAndDeletedFalse(MedicineCategory category, Pageable pageable);

    // Tìm theo hospital
    Page<Medicine> findByHospitalIdAndDeletedFalse(UUID hospitalId, Pageable pageable);

    List<Medicine> findByHospitalIdAndDeletedFalse(UUID hospitalId);

    // Tìm thuốc kê đơn
    Page<Medicine> findByRequiresPrescriptionTrueAndDeletedFalse(Pageable pageable);

    // Tìm thuốc sắp hết hạn
    List<Medicine> findByExpiryDateBeforeAndDeletedFalse(LocalDate date);

    // Tìm thuốc tồn kho thấp
    @Query("SELECT m FROM Medicine m WHERE m.deleted = false AND m.stockQuantity <= m.minStock")
    List<Medicine> findLowStockMedicines();

    // Tìm thuốc hết hạn
    @Query("SELECT m FROM Medicine m WHERE m.deleted = false AND m.expiryDate < CURRENT_DATE")
    List<Medicine> findExpiredMedicines();

    // Search với nhiều tiêu chí
    @Query("SELECT m FROM Medicine m WHERE m.deleted = false AND " +
            "(LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.activeIngredient) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Medicine> search(@Param("keyword") String keyword, Pageable pageable);

    // Tìm kiếm nâng cao
    @Query("SELECT m FROM Medicine m WHERE m.deleted = false AND " +
            "(:name IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:category IS NULL OR m.category = :category) AND " +
            "(:hospitalId IS NULL OR m.hospital.id = :hospitalId) AND " +
            "(:requiresPrescription IS NULL OR m.requiresPrescription = :requiresPrescription)")
    Page<Medicine> advancedSearch(
            @Param("name") String name,
            @Param("category") MedicineCategory category,
            @Param("hospitalId") UUID hospitalId,
            @Param("requiresPrescription") Boolean requiresPrescription,
            Pageable pageable
    );

    // Cập nhật stock
    @Modifying
    @Transactional
    @Query("UPDATE Medicine m SET m.stockQuantity = m.stockQuantity + :quantity " +
            "WHERE m.id = :id AND m.deleted = false")
    int updateStock(@Param("id") UUID id, @Param("quantity") int quantity);

    // Kiểm tra stock đủ không
    @Query("SELECT CASE WHEN (m.stockQuantity >= :quantity) THEN true ELSE false END " +
            "FROM Medicine m WHERE m.id = :id AND m.deleted = false")
    boolean hasSufficientStock(@Param("id") UUID id, @Param("quantity") int quantity);

    // Soft delete
    @Modifying
    @Transactional
    @Query("UPDATE Medicine m SET m.deleted = true, m.deletedAt = CURRENT_TIMESTAMP " +
            "WHERE m.id = :id")
    void softDeleteById(@Param("id") UUID id);

    boolean existsByCodeAndHospitalIdAndDeletedFalse(String code, UUID hospitalId);

    // Hoặc dùng @Query
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END " +
            "FROM Medicine m WHERE m.code = :code " +
            "AND m.hospital.id = :hospitalId " +
            "AND m.deleted = false")
    boolean existsByCodeAndHospitalId(@Param("code") String code,
            @Param("hospitalId") UUID hospitalId);
}