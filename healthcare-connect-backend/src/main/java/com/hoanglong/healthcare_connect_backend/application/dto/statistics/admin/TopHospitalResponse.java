package com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopHospitalResponse {
    UUID id;
    String name;
    String address;
    long doctorCount;
    long bookingCount;
    long revenue;
    int rank;   
}