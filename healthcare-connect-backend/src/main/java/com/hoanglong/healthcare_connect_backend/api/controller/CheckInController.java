package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.service.AppointmentService;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Controller
@RequestMapping("/check-in")
@RequiredArgsConstructor
public class CheckInController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> checkIn(@RequestParam String token) {
        try {
            UUID appointmentId = UUID.fromString(token);
            Appointment appointment = appointmentService.checkInByToken(appointmentId);

            Map<String, String> result = new HashMap<>();
            result.put("appointmentId", appointment.getId().toString());
            result.put("doctorName", appointment.getSchedule().getDoctor().getUser().getFullName());
            result.put("startTime", appointment.getSchedule().getStartTime().toString());
            result.put("roomNumber", appointment.getRoom() != null ? appointment.getRoom().getRoomNumber() : null);

            return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                    .status("success")
                    .message("Check-in thành công")
                    .data(result)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                    .status("error")
                    .message(e.getMessage())
                    .build());
        }
    }
}