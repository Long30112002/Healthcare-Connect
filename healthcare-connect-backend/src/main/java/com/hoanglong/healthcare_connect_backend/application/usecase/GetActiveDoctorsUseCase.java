//package com.hoanglong.healthcare_connect_backend.application.usecase;
//
//import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
//import com.hoanglong.healthcare_connect_backend.application.mapper.DoctorMapper;
//import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
//import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
//import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class GetActiveDoctorsUseCase {
//    private final IDoctorRepository doctorRepository;
//    private final DoctorMapper doctorMapper;
//
//    public List<DoctorResponse> execute() {
//        List<Doctor> doctors = doctorRepository.findAllByStatus(DoctorStatus.APPROVED);
//
//        return doctorMapper.toDoctorResponseList(doctors);
//    }
//}