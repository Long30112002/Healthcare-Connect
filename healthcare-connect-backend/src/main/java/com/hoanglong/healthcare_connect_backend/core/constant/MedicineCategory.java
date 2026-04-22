package com.hoanglong.healthcare_connect_backend.core.constant;

public enum MedicineCategory {
    ANALGESIC("Giảm đau", "Analgesic"),
    ANTIBIOTIC("Kháng sinh", "Antibiotic"),
    ANTIHYPERTENSIVE("Hạ huyết áp", "Antihypertensive"),
    ANTIDIABETIC("Tiểu đường", "Antidiabetic"),
    ANTIHISTAMINE("Kháng dị ứng", "Antihistamine"),
    ANTIVIRAL("Kháng virus", "Antiviral"),
    ANTIFUNGAL("Kháng nấm", "Antifungal"),
    VACCINE("Vắc-xin", "Vaccine"),
    VITAMIN("Vitamin & Khoáng chất", "Vitamin"),
    HORMONE("Nội tiết tố", "Hormone"),
    GASTROINTESTINAL("Tiêu hóa", "Gastrointestinal"),
    RESPIRATORY("Hô hấp", "Respiratory"),
    CARDIOVASCULAR("Tim mạch", "Cardiovascular"),
    OTHER("Khác", "Other");

    private final String displayName;
    private final String englishName;

    MedicineCategory(String displayName, String englishName) {
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