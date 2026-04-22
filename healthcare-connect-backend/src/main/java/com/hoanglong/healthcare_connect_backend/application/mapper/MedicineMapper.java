package com.hoanglong.healthcare_connect_backend.application.mapper;


import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicineRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicineResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Medicine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface MedicineMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deleted", constant = "false")
    @Mapping(target = "version", constant = "0L")
    @Mapping(target = "hospital", ignore = true) // Set riêng trong service
    Medicine toEntity(MedicineRequest request);

    @Mapping(source = "category", target = "categoryDisplayName", qualifiedByName = "getCategoryDisplayName")
    @Mapping(source = "dosageForm", target = "dosageFormDisplayName", qualifiedByName = "getDosageFormDisplayName")
    @Mapping(source = "price", target = "formattedPrice", qualifiedByName = "formatPrice")
    @Mapping(target = "lowStock", expression = "java(medicine.isLowStock())")
    @Mapping(target = "expired", expression = "java(medicine.isExpired())")
    @Mapping(source = "hospital.id", target = "hospitalId")
    @Mapping(source = "hospital.name", target = "hospitalName")
    MedicineResponse toResponse(Medicine medicine);

    List<MedicineResponse> toResponseList(List<Medicine> medicines);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "hospital", ignore = true)
    void updateEntity(@MappingTarget Medicine medicine, MedicineRequest request);

    @Named("getCategoryDisplayName")
    default String getCategoryDisplayName(com.hoanglong.healthcare_connect_backend.core.constant.MedicineCategory category) {
        return category != null ? category.getDisplayName() : null;
    }

    @Named("getDosageFormDisplayName")
    default String getDosageFormDisplayName(com.hoanglong.healthcare_connect_backend.core.constant.DosageForm dosageForm) {
        return dosageForm != null ? dosageForm.getDisplayName() : null;
    }

    @Named("formatPrice")
    default String formatPrice(BigDecimal price) {
        if (price == null) return "0đ";
        return String.format("%,.0fđ", price);
    }
}