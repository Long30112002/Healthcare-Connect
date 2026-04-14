package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class RoomRequest {
    @NotBlank(message = "Số phòng không được để trống")
    String roomNumber;

    Integer floor;
    String building;
}