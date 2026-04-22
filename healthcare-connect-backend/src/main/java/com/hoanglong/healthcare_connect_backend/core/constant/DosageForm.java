package com.hoanglong.healthcare_connect_backend.core.constant;

public enum DosageForm {
    TABLET("Viên nén", "Tablet"),
    CAPSULE("Viên nang", "Capsule"),
    SYRUP("Si-rô", "Syrup"),
    INJECTION("Dung dịch tiêm", "Injection"),
    CREAM("Kem bôi", "Cream"),
    OINTMENT("Thuốc mỡ", "Ointment"),
    INHALER("Bình xịt", "Inhaler"),
    DROPS("Thuốc nhỏ", "Drops"),
    PATCH("Miếng dán", "Patch"),
    POWDER("Bột", "Powder");

    private final String displayName;
    private final String englishName;

    DosageForm(String displayName, String englishName) {
        this.displayName = displayName;
        this.englishName = englishName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEnglishName() {
        return englishName;
    }
}