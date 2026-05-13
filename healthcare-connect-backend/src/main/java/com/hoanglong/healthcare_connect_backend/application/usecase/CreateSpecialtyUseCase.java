//package com.hoanglong.healthcare_connect_backend.application.usecase;
//
//import com.hoanglong.healthcare_connect_backend.application.dto.hospital.SpecialtyRequest;
//import com.hoanglong.healthcare_connect_backend.application.dto.hospital.SpecialtyResponse;
//import com.hoanglong.healthcare_connect_backend.application.mapper.SpecialtyMapper;
//import com.hoanglong.healthcare_connect_backend.application.service.SpecialtyService;
//import com.hoanglong.healthcare_connect_backend.core.entity.Department;
//import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;
//import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
//import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
//import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DepartmentRepository;
//import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.SpecialtyRepository;
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import org.springframework.stereotype.Service;
//
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//public class CreateSpecialtyUseCase {
//    private final SpecialtyService specialtyService;
//
//
//    public SpecialtyResponse execute(SpecialtyRequest request, UUID hospitalId) {
//        return specialtyService.create(request, hospitalId);
//    }
//
////    private String generateSpecialtyCode(String departmentCode) {
////        String randomPart = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
////        return departmentCode + "_" + randomPart;
////    }
//}