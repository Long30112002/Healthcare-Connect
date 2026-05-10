package com.hoanglong.healthcare_connect_backend.core.constant;

public enum Unit {
    BOX("Hộp", "Box"),
    BLISTER("Vỉ", "Blister"),
    BOTTLE("Chai", "Bottle"),
    TUBE("Ống", "Tube"),
    TABLET("Viên", "Tablet"),
    JAR("Lọ", "Jar"),
    BAG("Túi", "Bag"),
    PACK("Gói", "Pack");

    private final String vi;
    private final String en;

    Unit(String vi, String en) {
        this.vi = vi;
        this.en = en;
    }

    public String getDisplayName(String language) {
        return "vi".equals(language) ? vi : en;
    }
}