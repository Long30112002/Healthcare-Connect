package com.hoanglong.healthcare_connect_backend.core.constant;

import lombok.Getter;

@Getter
public enum MedicalCategory {
    INTERNAL_MEDICINE("Nội khoa"),
    SURGERY("Ngoại khoa"),
    PEDIATRICS("Nhi khoa"),
    ENT("Tai Mũi Họng"),
    DIAGNOSTIC_IMAGING("Chẩn đoán hình ảnh"),
    GENERAL("Tổng quát"),
    DERMATOLOGY("Da liễu"),
    OBSTETRICS("Sản phụ"),
    LABORATORY("Xét nghiệm"),
    OPHTHALMOLOGY("Mắt")
    ;

    private final String displayName;

    MedicalCategory(String displayName) {
        this.displayName = displayName;
    }
}