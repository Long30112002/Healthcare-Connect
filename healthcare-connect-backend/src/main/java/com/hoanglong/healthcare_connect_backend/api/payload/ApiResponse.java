package com.hoanglong.healthcare_connect_backend.api.payload;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private String status;
    private int code;
    private String errorKey;
    private String message;
    private T data;
//    private List<String> errors;
}