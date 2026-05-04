package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicalRecordResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.MedicalRecord;
import com.hoanglong.healthcare_connect_backend.core.entity.Prescription;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class MedicalRecordMapper {

    @Autowired
    protected ObjectMapper objectMapper;

    @Mapping(source = "appointment.id", target = "appointmentId")
    @Mapping(source = "patient.id", target = "patientId")
    @Mapping(source = "patient.fullName", target = "patientName")
    @Mapping(source = "patient.phone", target = "patientPhone")
    @Mapping(source = "patient.email", target = "patientEmail")
    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "doctor.user.fullName", target = "doctorName")
    @Mapping(source = "doctor.doctorCode", target = "doctorCode")
    @Mapping(source = "hospital.id", target = "hospitalId")
    @Mapping(source = "hospital.name", target = "hospitalName")
    @Mapping(source = "hospital.address", target = "hospitalAddress")
    @Mapping(target = "vitalSigns", ignore = true)
    @Mapping(target = "prescriptions", ignore = true)
    @Mapping(source = "prescriptions", target = "prescriptionCount", qualifiedByName = "countPrescriptions")
    public abstract MedicalRecordResponse toResponse(MedicalRecord entity);

    public abstract List<MedicalRecordResponse> toResponseList(List<MedicalRecord> entities);

    @Named("countPrescriptions")
    protected Integer countPrescriptions(List<Prescription> prescriptions) {
        return prescriptions != null ? prescriptions.size() : 0;
    }

    // Method để parse vitalSigns từ JSON
    protected MedicalRecordResponse.VitalSignsDto parseVitalSigns(String vitalSignsJson) {
        if (vitalSignsJson == null) return null;
        try {
            return objectMapper.readValue(vitalSignsJson, MedicalRecordResponse.VitalSignsDto.class);
        } catch (Exception e) {
            return null;
        }
    }
}