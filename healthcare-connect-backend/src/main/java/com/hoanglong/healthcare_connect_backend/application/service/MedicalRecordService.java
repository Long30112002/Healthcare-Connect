package com.hoanglong.healthcare_connect_backend.application.service;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicalRecordRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicalRecordResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.PrescriptionMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.MedicalRecordStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.PrescriptionStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.*;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.MedicalRecordRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.MedicineRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.UserRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicineRepository medicineRepository;
    private final PrescriptionMapper prescriptionMapper;
    private final ObjectMapper objectMapper;
    private final CurrentUserService currentUserService;
    private final MailService emailService;
    private final UserRepository userRepository;

    /**
     * Tạo bệnh án mới
     */
    public MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request) {
        log.info("Tạo bệnh án cho appointment: {}", request.getAppointmentId());

        // 1. Kiểm tra appointment tồn tại
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

        // 2. KIỂM TRA HOSPITAL - Chỉ bác sĩ của bệnh viện đó mới được tạo
        UUID currentHospitalId = currentUserService.getCurrentHospitalId();
        if (currentHospitalId == null || !appointment.getHospital().getId().equals(currentHospitalId)) {
            throw new AppException(ErrorCode.DOCTOR_NOT_IN_HOSPITAL);
        }

        // 3. Kiểm tra đã có bệnh án chưa
        if (medicalRecordRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new AppException(ErrorCode.MEDICAL_RECORD_ALREADY_EXISTS);
        }

        // 4. Kiểm tra bác sĩ có quyền tạo bệnh án cho appointment này không
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        UUID doctorUserId = appointment.getSchedule().getDoctor().getUser().getId();

        if (!doctorUserId.equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // 5. Chỉ tạo được khi appointment đã COMPLETED
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new AppException(ErrorCode.APPOINTMENT_NOT_COMPLETED);
        }

        // 6. Tạo MedicalRecord entity
        MedicalRecord medicalRecord = MedicalRecord.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getSchedule().getDoctor())
                .hospital(appointment.getHospital())
                .diagnosis(request.getDiagnosis())
                .symptoms(request.getSymptoms())
                .notes(request.getNotes())
                .followUpDate(request.getFollowUpDate())
                .status(MedicalRecordStatus.ACTIVE)
                .build();

        // 7. Convert vitalSigns DTO → JSON string
        if (request.getVitalSigns() != null) {
            try {
                String vitalSignsJson = objectMapper.writeValueAsString(request.getVitalSigns());
                medicalRecord.setVitalSigns(vitalSignsJson);
            } catch (JsonProcessingException e) {
                log.error("Lỗi convert vitalSigns: {}", e.getMessage());
            }
        }

        // 8. Tạo Prescriptions
        List<Prescription> prescriptions = new ArrayList<>();
        if (request.getPrescriptions() != null) {
            for (MedicalRecordRequest.PrescriptionDTO prescriptionDTO : request.getPrescriptions()) {
                Prescription prescription = Prescription.builder()
                        .medicalRecord(medicalRecord)
                        .prescriptionDate(LocalDate.now())
                        .note(prescriptionDTO.getNote())
                        .validUntil(prescriptionDTO.getValidUntil())
                        .status(PrescriptionStatus.ACTIVE)
                        .hospital(medicalRecord.getHospital())
                        .doctor(medicalRecord.getDoctor())
                        .patient(medicalRecord.getPatient())
                        .createdBy(getCurrentUser())
                        .build();


                // Tạo PrescriptionItems
                List<PrescriptionItem> items = new ArrayList<>();
                if (prescriptionDTO.getItems() != null) {
                    for (MedicalRecordRequest.PrescriptionItemDTO itemDTO : prescriptionDTO.getItems()) {
                        Medicine medicine = medicineRepository.findById(itemDTO.getMedicineId())
                                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

                        // KIỂM TRA THUỐC CÓ THUỘC BỆNH VIỆN HIỆN TẠI KHÔNG
                        if (medicine.getHospital() != null &&
                                !medicine.getHospital().getId().equals(currentHospitalId)) {
                            throw new AppException(ErrorCode.MEDICINE_NOT_IN_HOSPITAL);
                        }

                        // Kiểm tra số lượng thuốc trong kho
                        if (medicine.getStockQuantity() < itemDTO.getQuantity()) {
                            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
                        }

                        // Trừ số lượng thuốc trong kho
                        medicine.setStockQuantity(medicine.getStockQuantity() - itemDTO.getQuantity());
                        medicineRepository.save(medicine);

                        BigDecimal unitPrice = medicine.getPrice();
                        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(itemDTO.getQuantity()));

                        PrescriptionItem item = PrescriptionItem.builder()
                                .prescription(prescription)
                                .medicine(medicine)
                                .quantity(itemDTO.getQuantity())
                                .dosage(itemDTO.getDosage())
                                .frequency(itemDTO.getFrequency())
                                .duration(itemDTO.getDuration())
                                .instructions(itemDTO.getInstructions())
                                .unitPrice(unitPrice)
                                .totalPrice(totalPrice)
                                .build();

                        items.add(item);
                    }
                }

                prescription.setItems(items);
                prescription.calculateTotalAmount();
                prescriptions.add(prescription);
            }
        }

        medicalRecord.setPrescriptions(prescriptions);

        // 9. Lưu vào database
        MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);
        log.info("Đã tạo bệnh án thành công với ID: {}", savedRecord.getId());

        // 10. Gửi thông báo cho bệnh nhân qua EmailService
        emailService.sendMedicalRecordCreatedEmail(savedRecord);

        // 11. Convert entity → response DTO
        return convertToResponse(savedRecord);
    }

    /**
     * Chuyển đổi danh sách Prescription sang DTO
     */
    private List<MedicalRecordResponse.PrescriptionDto> convertPrescriptions(List<Prescription> prescriptions) {
        if (prescriptions == null || prescriptions.isEmpty()) {
            return new ArrayList<>();
        }
        return prescriptionMapper.toPrescriptionDtoList(prescriptions);
    }

    /**
     * Chuyển đổi MedicalRecord entity sang Response DTO
     */
    private MedicalRecordResponse convertToResponse(MedicalRecord record) {
        // Parse vitalSigns từ JSON
        MedicalRecordResponse.VitalSignsDto vitalSignsDto = null;
        if (record.getVitalSigns() != null) {
            try {
                vitalSignsDto = objectMapper.readValue(
                        record.getVitalSigns(),
                        MedicalRecordResponse.VitalSignsDto.class
                );

                // Tính BMI nếu có chiều cao và cân nặng
                if (vitalSignsDto != null && vitalSignsDto.getWeight() != null
                        && vitalSignsDto.getHeight() != null
                        && vitalSignsDto.getHeight().doubleValue() > 0) {
                    double heightInMeters = vitalSignsDto.getHeight().doubleValue() / 100;
                    double bmi = vitalSignsDto.getWeight().doubleValue() / (heightInMeters * heightInMeters);
                    vitalSignsDto.setBmi(BigDecimal.valueOf(Math.round(bmi * 10) / 10.0));
                }
            } catch (JsonProcessingException e) {
                log.error("Lỗi parse vitalSigns: {}", e.getMessage());
            }
        }

        UUID patientId = null;
        String patientName = null;
        String patientPhone = null;
        String patientEmail = null;

        if (record.getPatient() != null) {
            // Bệnh nhân có tài khoản
            patientId = record.getPatient().getId();
            patientName = record.getPatient().getFullName();
            patientPhone = record.getPatient().getPhone();
            patientEmail = record.getPatient().getEmail();
        } else if (record.getAppointment() != null) {
            // Walk-in patient (không có tài khoản)
            patientName = record.getAppointment().getPatientName();
            patientPhone = record.getAppointment().getPatientPhone();
            patientEmail = null;  // Walk-in không có email
        }

        // Lấy thông tin doctor (luôn có, không null)
        UUID doctorId = record.getDoctor() != null ? record.getDoctor().getId() : null;
        String doctorName = record.getDoctor() != null && record.getDoctor().getUser() != null
                ? record.getDoctor().getUser().getFullName() : null;
        String doctorCode = record.getDoctor() != null ? record.getDoctor().getDoctorCode() : null;

        // Lấy thông tin hospital (luôn có)
        UUID hospitalId = record.getHospital() != null ? record.getHospital().getId() : null;
        String hospitalName = record.getHospital() != null ? record.getHospital().getName() : null;
        String hospitalAddress = record.getHospital() != null ? record.getHospital().getAddress() : null;

        // Build response
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .appointmentId(record.getAppointment() != null ? record.getAppointment().getId() : null)
                .patientId(patientId)
                .patientName(patientName)
                .patientPhone(patientPhone)
                .patientEmail(patientEmail)
                .doctorId(doctorId)
                .doctorName(doctorName)
                .doctorCode(doctorCode)
                .hospitalId(hospitalId)
                .hospitalName(hospitalName)
                .hospitalAddress(hospitalAddress)
                .diagnosis(record.getDiagnosis())
                .symptoms(record.getSymptoms())
                .notes(record.getNotes())
                .vitalSigns(vitalSignsDto)
                .followUpDate(record.getFollowUpDate())
                .status(record.getStatus())
                .prescriptionCount(record.getPrescriptions() != null ? record.getPrescriptions().size() : 0)
                .prescriptions(convertPrescriptions(record.getPrescriptions()))
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }

    /**
     * Lấy bệnh án theo appointment ID
     */
    public MedicalRecordResponse getByAppointmentId(UUID appointmentId) {
        MedicalRecord record = medicalRecordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.MEDICAL_RECORD_NOT_FOUND));

        // KIỂM TRA QUYỀN TRUY CẬP
        checkAccessPermission(record);

        return convertToResponse(record);
    }

    /**
     * Lấy danh sách bệnh án theo patient ID
     */
    public List<MedicalRecordResponse> getByPatientId(UUID patientId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        String currentRole = SecurityUtils.getCurrentUserRole();

        // 🟢 KIỂM TRA QUYỀN: Chỉ patient đó hoặc doctor/manager/admin mới xem được
        if (!currentRole.equals("ROLE_ADMIN") &&
                !currentRole.equals("ROLE_DOCTOR") &&
                !currentRole.equals("ROLE_HOSPITAL_MANAGER") &&
                !currentUserId.equals(patientId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        List<MedicalRecord> records = medicalRecordRepository
                .findByPatientIdAndDeletedFalseOrderByCreatedAtDesc(patientId);
        return records.stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * KIỂM TRA QUYỀN TRUY CẬP BỆNH ÁN
     */
    private void checkAccessPermission(MedicalRecord record) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        String currentRole = SecurityUtils.getCurrentUserRole();
        UUID currentHospitalId = currentUserService.getCurrentHospitalId();

        boolean hasAccess = switch (currentRole) {
            case "ROLE_ADMIN" -> true;
            case "ROLE_HOSPITAL_MANAGER" ->
                    currentHospitalId != null && record.getHospital().getId().equals(currentHospitalId);
            case "ROLE_DOCTOR" ->
                    record.getDoctor().getUser().getId().equals(currentUserId);
            case "ROLE_PATIENT" ->
                    record.getPatient().getId().equals(currentUserId);
            case "ROLE_RECEPTIONIST" ->
                    currentHospitalId != null && record.getHospital().getId().equals(currentHospitalId);
            default -> false;
        };

        if (!hasAccess) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    /**
     * CẬP NHẬT BỆNH ÁN
     */
    public MedicalRecordResponse updateMedicalRecord(UUID id, MedicalRecordRequest request) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MEDICAL_RECORD_NOT_FOUND));

        // Kiểm tra quyền cập nhật (chỉ bác sĩ tạo ra mới được sửa)
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!record.getDoctor().getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Cập nhật thông tin
        record.setDiagnosis(request.getDiagnosis());
        record.setSymptoms(request.getSymptoms());
        record.setNotes(request.getNotes());
        record.setFollowUpDate(request.getFollowUpDate());

        if (request.getVitalSigns() != null) {
            try {
                String vitalSignsJson = objectMapper.writeValueAsString(request.getVitalSigns());
                record.setVitalSigns(vitalSignsJson);
            } catch (JsonProcessingException e) {
                log.error("Lỗi convert vitalSigns: {}", e.getMessage());
            }
        }

        MedicalRecord savedRecord = medicalRecordRepository.save(record);
        log.info("Đã cập nhật bệnh án ID: {}", savedRecord.getId());

        return convertToResponse(savedRecord);
    }

    /**
     * XÓA BỆNH ÁN (Soft delete)
     */
    public void deleteMedicalRecord(UUID id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MEDICAL_RECORD_NOT_FOUND));

        // Kiểm tra quyền xóa (chỉ admin hoặc bác sĩ tạo ra)
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        String currentRole = SecurityUtils.getCurrentUserRole();

        boolean canDelete = currentRole.equals("ROLE_ADMIN") ||
                record.getDoctor().getUser().getId().equals(currentUserId);

        if (!canDelete) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        medicalRecordRepository.softDeleteById(id);
        log.info("Đã xóa bệnh án ID: {}", id);
    }

    /**
     * Lấy current user từ SecurityContext
     */
    private User getCurrentUser() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}