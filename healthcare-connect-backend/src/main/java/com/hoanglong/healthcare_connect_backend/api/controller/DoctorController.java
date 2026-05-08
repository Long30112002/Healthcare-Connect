package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.appointment.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.appointment.WalkInAppointmentDto;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalWorkingHours;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.WorkingHoursResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.schedule.ScheduleRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.schedule.ScheduleResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.user.UpdateDoctorInfoRequest;
import com.hoanglong.healthcare_connect_backend.application.mapper.AppointmentMapper;
import com.hoanglong.healthcare_connect_backend.application.mapper.DoctorMapper;
import com.hoanglong.healthcare_connect_backend.application.mapper.ScheduleMapper;
import com.hoanglong.healthcare_connect_backend.application.mapper.WorkingHoursMapper;
import com.hoanglong.healthcare_connect_backend.application.service.AppointmentService;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorService;
import com.hoanglong.healthcare_connect_backend.application.service.ScheduleService;
import com.hoanglong.healthcare_connect_backend.application.usecase.CreateScheduleUseCase;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DoctorRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalWorkingHoursRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController
{

    private final CreateScheduleUseCase createScheduleUseCase;
    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final ScheduleService scheduleService;
    private final ScheduleMapper scheduleMapper;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;
    private final DoctorMapper doctorMapper;
    private final HospitalWorkingHoursRepository workingHoursRepository;
    private final WorkingHoursMapper workingHoursMapper;

    @GetMapping("/my-info")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<DoctorResponse> getMyInfo() {
        DoctorResponse response = doctorService.getMyInfo();
        return ApiResponse.<DoctorResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin bác sĩ thành công!")
                .data(response)
                .build();
    }

    @PutMapping("/my-info")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<DoctorResponse> updateMyInfo(@RequestBody @Valid UpdateDoctorInfoRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Doctor updatedDoctor = doctorService.updateMyInfo(currentUserId, request);
        return ApiResponse.<DoctorResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Cập nhật thông tin bác sĩ thành công!")
                .data(doctorMapper.toDoctorResponse(updatedDoctor))
                .build();
    }

    @GetMapping("/hospital-working-hours")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<List<WorkingHoursResponse>> getHospitalWorkingHours() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Doctor doctor = doctorRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        UUID hospitalId = doctor.getHospital().getId();
        List<HospitalWorkingHours> workingHours = workingHoursRepository
                .findByHospitalIdAndIsActiveTrueOrderByDayOfWeekAsc(hospitalId);

        List<WorkingHoursResponse> response = workingHoursMapper.toResponseList(workingHours);

        return ApiResponse.<List<WorkingHoursResponse>>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }

    @GetMapping("/patients/{patientId}/appointments")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<List<AppointmentResponse>> getPatientAppointments(@PathVariable UUID patientId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Doctor doctor = doctorRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        List<Appointment> appointments = appointmentRepository.findByPatientIdAndDoctorId(patientId, doctor.getId());

        return ApiResponse.<List<AppointmentResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách lịch hẹn thành công!")
                .data(appointments.stream().map(appointmentMapper::toResponse).collect(Collectors.toList()))
                .build();
    }

    @GetMapping("/my-patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<List<Map<String, Object>>> getMyPatients() {
        List<Map<String, Object>> patients = doctorService.getAllMyPatients();
        return ApiResponse.<List<Map<String, Object>>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách bệnh nhân thành công!")
                .data(patients)
                .build();
    }

    @GetMapping("/walk-in-appointments")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<List<WalkInAppointmentDto>> getWalkInAppointments(@RequestParam String phone) {
        List<WalkInAppointmentDto> appointments = doctorService.getWalkInAppointments(phone);
        return ApiResponse.<List<WalkInAppointmentDto>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách lần khám thành công!")
                .data(appointments)
                .build();
    }

    @PostMapping("/schedules")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<ScheduleResponse> create(@RequestBody @Valid ScheduleRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();

        return ApiResponse.<ScheduleResponse>builder()
                .status("success")
                .code(200)
                .message("Tạo lịch khám thành công!")
                .data(createScheduleUseCase.execute(userId, request))
                .build();
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<Page<AppointmentResponse>> getMyAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();

        Doctor doctor = doctorService.getDoctorEntityByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").ascending());
        Page<AppointmentResponse> appointments = appointmentService.getDoctorAppointments(doctor.getId(), status, pageable);

        return ApiResponse.<Page<AppointmentResponse>>builder()
                .status("success")
                .code(200)
                .message("Lấy danh sách lịch hẹn thành công")
                .data(appointments)
                .build();
    }

    @PatchMapping("/{appointmentId}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<String> completeExam(@PathVariable UUID appointmentId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        appointmentService.completeExam(appointmentId, currentUserId);

        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .message("Kết thúc khám thành công!")
                .data("Đã hoàn thành khám bệnh")
                .build();
    }

    @GetMapping("/schedules")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<Page<ScheduleResponse>> getMySchedules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Doctor doctor = doctorService.getDoctorEntityByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        Page<Schedule> schedules = scheduleService.getSchedulesByDoctorId(doctor.getId(), pageable);

        return ApiResponse.<Page<ScheduleResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách lịch làm việc thành công!")
                .data(schedules.map(scheduleMapper::toResponse))
                .build();
    }

    @GetMapping("/schedules/{scheduleId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<ScheduleResponse> getScheduleById(@PathVariable UUID scheduleId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Schedule schedule = scheduleService.getScheduleById(scheduleId, currentUserId);
        return ApiResponse.<ScheduleResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy chi tiết lịch làm việc thành công!")
                .data(scheduleMapper.toResponse(schedule))
                .build();
    }

    @PutMapping("/schedules/{scheduleId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<ScheduleResponse> updateSchedule(
            @PathVariable UUID scheduleId,
            @Valid @RequestBody ScheduleRequest request
    ) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Schedule schedule = scheduleService.updateSchedule(scheduleId, request, currentUserId);
        return ApiResponse.<ScheduleResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Cập nhật lịch làm việc thành công!")
                .data(scheduleMapper.toResponse(schedule))
                .build();
    }


    @DeleteMapping("/schedules/{scheduleId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<Void> deleteSchedule(@PathVariable UUID scheduleId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        scheduleService.deleteSchedule(scheduleId, currentUserId);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Xóa lịch làm việc thành công!")
                .build();
    }

    @GetMapping("/check-room")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<Map<String, Object>> checkRoomAvailability(
            @RequestParam UUID roomId,
            @RequestParam LocalDate date,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime
    ) {
        Map<String, Object> result = scheduleService.checkRoomAvailability(roomId, date, startTime, endTime);
        return ApiResponse.<Map<String, Object>>builder().data(result).build();
    }
}