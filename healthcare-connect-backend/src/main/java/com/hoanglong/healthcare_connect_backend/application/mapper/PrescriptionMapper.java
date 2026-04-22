package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicalRecordResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Prescription;
import com.hoanglong.healthcare_connect_backend.core.entity.PrescriptionItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PrescriptionMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "prescriptionDate", target = "prescriptionDate")
    @Mapping(source = "note", target = "note")
    @Mapping(source = "totalAmount", target = "totalAmount")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "validUntil", target = "validUntil")
    @Mapping(target = "isValid", expression = "java(prescription.isValid())")
    @Mapping(source = "items", target = "items", qualifiedByName = "mapItems")
    MedicalRecordResponse.PrescriptionDto toPrescriptionDto(Prescription prescription);

    List<MedicalRecordResponse.PrescriptionDto> toPrescriptionDtoList(List<Prescription> prescriptions);

    @Named("mapItems")
    default List<MedicalRecordResponse.PrescriptionItemDto> mapItems(List<PrescriptionItem> items) {
        if (items == null) return null;
        return items.stream()
                .map(this::toPrescriptionItemDto)
                .toList();
    }

    @Mapping(source = "id", target = "id")
    @Mapping(source = "medicine.id", target = "medicineId")
    @Mapping(source = "medicine.name", target = "medicineName")
    @Mapping(source = "medicine.code", target = "medicineCode")
    @Mapping(source = "medicine.unit", target = "medicineUnit")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "dosage", target = "dosage")
    @Mapping(source = "frequency", target = "frequency")
    @Mapping(source = "duration", target = "duration")
    @Mapping(source = "instructions", target = "instructions")
    @Mapping(source = "unitPrice", target = "unitPrice")
    @Mapping(source = "totalPrice", target = "totalPrice")
    MedicalRecordResponse.PrescriptionItemDto toPrescriptionItemDto(PrescriptionItem item);
}